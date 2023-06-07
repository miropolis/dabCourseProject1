import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import * as programmingSubmissionsService from "./services/programmingSubmissionsService.js";
import { serve } from "./deps.js";
import { connect } from "./deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

// Create Redis Consumer Group and stream on startup (if it doesn't exist yet)
try {
  const redisInfo = await redis.xinfoGroups("grading-stream");
  console.log(redisInfo[0].name);
} catch (e) {
  console.log("Looks like grading-stream does not exist yet. Creating it and the consumer group now...");
  await redis.xgroupCreate(
    "grading-stream",
    "Redis-Grader-Group",
    0, //what message to serve next at the first consumer connecting, that is, what was the last message ID when the group was just created. If we provide $ as we did, then only new messages arriving in the stream from now on will be provided to the consumers in the group. If we specify 0 instead the consumer group will consume all the messages in the stream history to start with. 
    true, //mkstream true, creates the stream if it doesn't exist
  );
};

const handleGetRoot = async (request) => {
  return new Response(`Hello from ...`);
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
      const feedbackData = {
        id: oldUserSubmissions[i].id,
        correct: oldUserSubmissions[i].correct,
        errorType: evaluateGraderFeedback(oldUserSubmissions[i].grader_feedback)[1], // TODO calling graderFeedback here let to a bug when the oldUserSubmission did not have grader_feedback yet (NULL). When a user can only have 1 pending submission this should not be a problem
        graderFeedback: oldUserSubmissions[i].grader_feedback,
        alreadyGraded: true,
      };
      return Response.json(feedbackData);
    };
  };

  //put this statement before the for block to write all submissions (even duplicates) to database
  const submissionID = await programmingSubmissionsService.writeSubmission(submission.assignmentNumber, submission.code, submission.user);

  const programmingAssignments = await programmingAssignmentService.findAll();
  const testCode = programmingAssignments[submission.assignmentNumber-1]["test_code"];
  const data = {
    testCode: testCode,
    code: submission.code,
  };

  // Send submission to Redis stream
  await redis.xadd(
    "grading-stream",
    "*", // let redis assign message ID
    { user: submission.user, assignmentNumber: submission.assignmentNumber, code: submission.code, testCode: testCode },
  );

  const feedbackData = {
    id: submissionID[0].id,
    correct: false,
    errorType: "Placeholder error typee",
    graderFeedback: "Placeholder graderFeedback",
    alreadyGraded: false,
  };
  
  return Response.json(feedbackData);
};

const handlePostSubmissions = async (request) => {
  const searchParams = await request.json();
  return Response.json(await programmingSubmissionsService.findByUuidAndAssignmentID(searchParams.user, searchParams.assignmentNumber));
}

const handlePostSubmissionsPending = async (request) => {
  const searchParams = await request.json();
  return Response.json(await programmingSubmissionsService.findByUuidAndPending(searchParams.user));
};

const handlePostSubmissionUpdate = async (request) => {
  const updatedSubmission = await request.json();
  const evaluatedGraderFeedback = evaluateGraderFeedback(updatedSubmission.graderFeedback);
  programmingSubmissionsService.gradeSubmission(updatedSubmission.assignmentNumber, updatedSubmission.code, updatedSubmission.user, "processed", updatedSubmission.graderFeedback, evaluatedGraderFeedback[0]);
  const data = {
    feedback: "returned successfully",
  };
  return Response.json(data);
};

const handlePostSubmissionStatus = async (request) => {
  const searchParams = await request.json();
  let submission = await programmingSubmissionsService.findByID(searchParams.id);
  let i = 1;
  while (submission[0].status != "processed") {
    i++;
    submission = await programmingSubmissionsService.findByID(searchParams.id);
    await new Promise(r => setTimeout(r, 500));
  }
  const evaluatedGraderFeedback = evaluateGraderFeedback(submission[0].grader_feedback);
  const data = {
    id: submission[0].id,
    correct: submission[0].correct,
    errorType: evaluatedGraderFeedback[1],
    graderFeedback: submission[0].grader_feedback,
  };
  return Response.json(data);
};

const urlMapping = [
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
    pattern: new URLPattern({ pathname: "/submission-update" }),
    fn: handlePostSubmissionUpdate,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submission-status" }),
    fn: handlePostSubmissionStatus,
  },
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
  } else if (graderFeedback.slice(-6) === "syntax" || graderFeedback.includes("NameError") || graderFeedback.includes("SyntaxError")) {
    errorType = "Syntax Error!";
  } else if (graderFeedback.slice(-2) === "") {
    errorType = "Time out error!";
  } else {
    errorType = "Test runs but fails!";
  }
  return [submissionCorrect, errorType]
}
