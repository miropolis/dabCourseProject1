<script>
  import { userUuid } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  let submissionSuccessful = false;
  let submissionEvent = false;
  let jsonData;
  let errorText;
  
  const submitAssignmentCode = async () => {

    const data = {
    user: $userUuid,
    assignmentNumber: assignmentID,
    code: userCode,
    };

    const response = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    jsonData = await response.json();
    console.log(jsonData);
    // Tests are run and they pass (i.e. grading is successful)
    // Tests are run and they fail (i.e. grading failed)
    // Tests cannot be run due to a syntax error (i.e. syntax error in code)
    // Tests time out and no output is given (i.e. there's an infinite loop in code or tests)
    console.log(jsonData.result.slice(-2))
    if (jsonData.result.slice(-2) === "OK") {
      submissionSuccessful = true;
    } else if (jsonData.result.slice(-6) === "syntax") {
      submissionSuccessful = false;
      errorText = "Syntax Error!";
    } else if (jsonData.result.slice(-2) === "") {
      submissionSuccessful = false;
      errorText = "Time out error!";
    } else {
      submissionSuccessful = false;
      errorText = "Test runs but fails!";
    }
    submissionEvent = true;
  };

  const getGrading = async () => {
    
  }
</script>
<textarea bind:value={userCode} class="w-full bg-gray-900 text-white font-mono p-2.5 h-48 border-4 border-black focus:border-4 focus:border-blue-500" placeholder="Write your Python code here..."></textarea>
<button
  class="bg-gray-600 hover:bg-gray-900 text-white font-bold p-4 m-4"
  on:click={submitAssignmentCode}
>
  Submit for grading
</button>
{#if submissionSuccessful && submissionEvent}
  <div class="bg-green-600">
    <p>Your submission was successful!</p>
    <p><a href="/assignment-{assignmentID+1}/">Go to the next assignment</a></p>
  </div>
{/if}
{#if submissionSuccessful == false && submissionEvent}
  <div class="bg-red-500">
    <p>Your submission was not succesful!</p>
    <p>{errorText}</p>
    {#await jsonData}
      <p>Awaiting data...</p>
      {:then jsonResponse}
      {JSON.stringify(jsonResponse)}
    {/await}
  </div>
{/if}
