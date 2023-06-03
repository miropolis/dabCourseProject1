import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import * as programmingSubmissionsService from "./services/programmingSubmissionsService.js";
import { serve } from "./deps.js";
import { connect } from "./deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

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
