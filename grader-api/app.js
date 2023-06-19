import { serve } from "./deps.js";
import { grade } from "./services/gradingService.js";
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

// On startup start consumer
while(true) {

  const [gradingMessageStream] = await redis.xreadgroup(
    [{ key: "grading-stream", xid: ">" }],
    { group: "Redis-Grader-Group", consumer: "Grading-Consumer", count: 1 },
  );
  if (gradingMessageStream) {
    const code = gradingMessageStream.messages[0].fieldValues.code
    const testCode = gradingMessageStream.messages[0].fieldValues.testCode
    const result = await grade(code, testCode);

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

    await redis.xack(
      "grading-stream",
      "Redis-Grader-Group",
      gradingMessageStream.messages[0].xid.unixMs,
    );
  };
  

  await new Promise(r => setTimeout(r, 500));
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