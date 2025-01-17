import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import * as programmingSubmissionsService from "./services/programmingSubmissionsService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import { serve } from "./deps.js";
import { connect } from "./deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

const cachedProgrammingAssignmentService = cacheMethodCalls(programmingAssignmentService, []);
const cachedProgrammingSubmissionsService = cacheMethodCalls(programmingSubmissionsService, ["writeSubmission", "gradeSubmission"]);

const handleGetRoot = async (request) => {
  return new Response(`Hello from ...`);
};

const handleGetAssignments = async (request) => {
  const programmingAssignments = await cachedProgrammingAssignmentService.findAll();
  return Response.json(programmingAssignments);
};

const handleGetHighestAssignment = async (request) => {
  return Response.json(await cachedProgrammingAssignmentService.findHighestAssignment());
};

const handlePostGrade = async (request) => {
  const submission = await request.json();
  const oldUserSubmissions = await cachedProgrammingSubmissionsService.findByUuidAndAssignmentID(submission.user, submission.assignmentNumber);

  for (let i = 0; i < oldUserSubmissions.length; i++) {
    if (oldUserSubmissions[i].code === submission.code) {
      const feedbackData = {
        id: oldUserSubmissions[i].id,
        correct: oldUserSubmissions[i].correct,
        errorType: evaluateGraderFeedback(oldUserSubmissions[i].grader_feedback)[1],
        graderFeedback: oldUserSubmissions[i].grader_feedback,
        alreadyGraded: true,
      };
      return Response.json(feedbackData);
    };
  };

  //put this statement before the for block to write all submissions (even duplicates) to database
  const submissionID = await cachedProgrammingSubmissionsService.writeSubmission(submission.assignmentNumber, submission.code, submission.user);

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
  return Response.json(await cachedProgrammingSubmissionsService.findByUuidAndAssignmentID(searchParams.user, searchParams.assignmentNumber));
}

const handlePostSubmissionsPending = async (request) => {
  const searchParams = await request.json();
  return Response.json(await cachedProgrammingSubmissionsService.findByUuidAndPending(searchParams.user));
};

const handlePostSubmissionUpdate = async (request) => {
  const updatedSubmission = await request.json();
  const evaluatedGraderFeedback = evaluateGraderFeedback(updatedSubmission.graderFeedback);
  cachedProgrammingSubmissionsService.gradeSubmission(updatedSubmission.assignmentNumber, updatedSubmission.code, updatedSubmission.user, "processed", updatedSubmission.graderFeedback, evaluatedGraderFeedback[0]);
  const data = {
    feedback: "returned successfully",
  };
  return Response.json(data);
};

const handlePostSubmissionStatus = async (request) => {
  const searchParams = await request.json();
  let submission = await cachedProgrammingSubmissionsService.findByID(searchParams.id);
  let i = 1;
  while (submission[0].status != "processed") {
    i++;
    submission = await cachedProgrammingSubmissionsService.findByID(searchParams.id);
    await new Promise(r => setTimeout(r, 100));
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

const handlePostSubmissionsCorrect = async (request) => {
  const searchParams = await request.json();
  const answerString = "User uuid back to you: " + searchParams.user;
  const data = {user: answerString};
  return Response.json(await cachedProgrammingSubmissionsService.findMaxAssignmentNumberByUuidAndCorrect(searchParams.user));
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignments" }),
    fn: handleGetAssignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/highest-assignment" }),
    fn: handleGetHighestAssignment,
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
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submissions-correct" }),
    fn: handlePostSubmissionsCorrect,
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
