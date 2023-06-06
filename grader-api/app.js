import { serve } from "./deps.js";
import { grade } from "./services/gradingService.js";
import { connect } from "./deps.js";

// TODO fix the redis connect import on startup, sometimes does not download (cache it?)
// THEN try to run 2 deployments

const redis = await connect({
  hostname: "redis",
  port: 6379,
});
console.log(redis);

// On startup start consumer
// TODO implement wake up functionality upon submission through GradingButton, which starts the consumer for a certain amount of time
while(true) {
  console.log("Still trsue");

  const [gradingMessageStream] = await redis.xreadgroup(
    [{ key: "grading-stream", xid: ">" }],
    { group: "Redis-Grader-Group", consumer: "Grading-Consumer", count: 1 }, // TODO can consumers have the same name? otherwise find solution for multiple deployments
  );
  if (gradingMessageStream) {
    console.log("Reading from consumer group: ", gradingMessageStream.messages[0].xid.unixMs);
    const code = gradingMessageStream.messages[0].fieldValues.code
    const testCode = gradingMessageStream.messages[0].fieldValues.testCode
    const result = await grade(code, testCode);
    console.log("Result: ", result);

    const data = {
      user: gradingMessageStream.messages[0].fieldValues.user,
      assignmentNumber: gradingMessageStream.messages[0].fieldValues.assignmentNumber,
      code: code,
      graderFeedback: result,
      };
     const responseFromProgrammingAPI = await fetch("http://programming-api:7777/submission-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const jsonResponse = await responseFromProgrammingAPI.json();
      console.log(jsonResponse);

    await redis.xack(
      "grading-stream",
      "Redis-Grader-Group",
      gradingMessageStream.messages[0].xid.unixMs,
    );
  };
  

  await new Promise(r => setTimeout(r, 4000));
};

const handleRequest = async (request) => {
  // the starting point for the grading api grades code following the
  // gradingDemo function, but does not e.g. use code from the user
  const requestData = await request.json();

  console.log("Request data:");
  console.log(requestData);

  const code = requestData.code;
  const testCode = requestData.testCode;

  const result = await grade(code, testCode);


  // in practice, you would either send the code to grade to the grader-api
  // or use e.g. a message queue that the grader api would read and process

  return new Response(JSON.stringify({ result: result }));
};

const portConfig = { port: 7000, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);