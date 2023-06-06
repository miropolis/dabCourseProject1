import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import * as programmingSubmissionsService from "./services/programmingSubmissionsService.js";
import { serve } from "./deps.js";
import { connect } from "./deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

// Create Redis Consumer Group and stream on startup
await redis.xgroupCreate(
  "grading-stream",
  "Redis-Grader-Group",
  0, //what message to serve next at the first consumer connecting, that is, what was the last message ID when the group was just created. If we provide $ as we did, then only new messages arriving in the stream from now on will be provided to the consumers in the group. If we specify 0 instead the consumer group will consume all the messages in the stream history to start with. 
  true, //mkstream true, creates the stream if it doesn't exist
);

const handleGetRoot = async (request) => {
  return new Response(`Hello from ...`); //show user uuid?
};

const handleGetTest = async (request) => {
  return new Response("Test message");
};

const handleGetAssignments = async (request) => {
  const programmingAssignments = await programmingAssignmentService.findAll();
  return Response.json(programmingAssignments);
};

const handlePostGrade = async (request) => {
  const submission = await request.json();
  const oldUserSubmissions = await programmingSubmissionsService.findByUuidAndAssignmentID(submission.user, submission.assignmentNumber);

  for (let i = 0; i < oldUserSubmissions.length; i++) {
    if (oldUserSubmissions[i].code === submission.code) {
      console.log("Same assignment found!");
      const feedbackData = {
        correct: oldUserSubmissions[i].correct,
        errorType: evaluateGraderFeedback(oldUserSubmissions[i].grader_feedback)[1],
        graderFeedback: oldUserSubmissions[i].grader_feedback,
      };
      return Response.json(feedbackData);
    };
  };

  //put this statement before the for block to write all submissions (even duplicates) to database
  await programmingSubmissionsService.writeSubmission(submission.assignmentNumber, submission.code, submission.user);

  const programmingAssignments = await programmingAssignmentService.findAll();
  const testCode = programmingAssignments[submission.assignmentNumber-1]["test_code"];
  const data = {
    testCode: testCode,
    code: submission.code,
  };

  // Send submission to Redis stream
  // Submission needs to include all information (assignment number, user, code, testCode)
  // When grader has processed an item from the queue, it should call an API endpoint of programming-api that updates the database entry of the code
  // How to update the UI? --> look at hint with submission ID
  await redis.xadd(
    "grading-stream",
    "*", // let redis assign message ID
    { user: submission.user, assignmentNumber: submission.assignmentNumber, code: submission.code, testCode: testCode },
  );

  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const responseJSON = await response.json();
  const evaluatedGraderFeedback = evaluateGraderFeedback(responseJSON.result);

  await programmingSubmissionsService.gradeSubmission(submission.assignmentNumber, submission.code, submission.user, "processed", responseJSON.result, evaluatedGraderFeedback[0]);
  console.log("just sent another grading request")
   const feedbackData = {
    correct: evaluatedGraderFeedback[0],
    errorType: evaluatedGraderFeedback[1],
    graderFeedback: responseJSON.result,
  };
  
  return Response.json(feedbackData);
};

const handlePostSubmissions = async (request) => {
  const searchParams = await request.json();
  console.log("handlePostSubmissions called with params: ", searchParams)
  return Response.json(await programmingSubmissionsService.findByUuidAndAssignmentID(searchParams.user, searchParams.assignmentNumber));
}

const handlePostSubmissionsPending = async (request) => {
  const searchParams = await request.json();
  return Response.json(await programmingSubmissionsService.findByUuidAndPending(searchParams.user));
};

const handlePostRedis = async (request) => {
  const searchParams = await request.json();
  console.log("Parameters to update stream with: ", searchParams);

  /*await redis.del(
    "somestream",
  );*/
  /*await redis.xgroupDestroy(
    "somestream",
    "Redis-Consumer-Group-1",
  );

  await redis.xgroupCreate(
    "somestream",
    "Redis-Consumer-Group-1",
    0,
    true, //mkstream true, creates the stream if it doesn't exist
  );*/

  await redis.xadd(
    "somestream",
    "*", // let redis assign message ID
    { method: "The method", parameter: searchParams.parameter },
  );
  await redis.xadd(
    "somestream",
    "*", // let redis assign message ID
    { method: "The method", parameter: searchParams.parameter+1 },
  );

  let lengthOfStream = await redis.xlen("somestream");
  console.log(lengthOfStream)

  await redis.xack(
    "somestream",
    "Redis-Consumer-Group-1",
    1686047415604,
  );

  const [streamFromGroup] = await redis.xreadgroup(
    [{ key: "somestream", xid: ">" }],
    { group: "Redis-Consumer-Group-1", consumer: "TestConsumer", count: 1 },
  );
  console.log("Reading from consumer group: ", streamFromGroup);

  const [streamFromGroup2] = await redis.xreadgroup(
    [{ key: "somestream", xid: ">" }],
    { group: "Redis-Consumer-Group-1", consumer: "TestConsumer-2", count: 1 },
  );
  console.log("Reading from consumer group 2: ", streamFromGroup2);


  const [stream] = await redis.xread(
    [{ key: "somestream", xid: 0 }], // read from beginning
    { block: 5000 },
  );
  const msgFV = stream.messages[0].fieldValues;
  console.log("Redis Test Stream Output: ", msgFV);
  //console.log("Redis full stream output: ", stream)

  return new Response("Test message");
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/test" }),
    fn: handleGetTest,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handleGetAssignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/grade" }),
    fn: handlePostGrade,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submissions" }),
    fn: handlePostSubmissions,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submissions-pending" }),
    fn: handlePostSubmissionsPending,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/redis" }),
    fn: handlePostRedis,
  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    console.log("Calling mapping Result because of URL ", request.url);
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  console.log("Calling mapping Result because of URL ", request.url);
  return await mapping.fn(request, mappingResult);
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);

const evaluateGraderFeedback = (graderFeedback) => {
  let submissionCorrect = false;
  let errorType = "";
  if (graderFeedback.slice(-2) === "OK") {
    submissionCorrect = true;
  } else if (graderFeedback.slice(-6) === "syntax") {
    errorType = "Syntax Error!";
  } else if (graderFeedback.includes("NameError")) {
    errorType = "Syntax Error!";
  } else if (graderFeedback.slice(-2) === "") {
    errorType = "Time out error!";
  } else {
    errorType = "Test runs but fails!";
  }
  return [submissionCorrect, errorType]
}
