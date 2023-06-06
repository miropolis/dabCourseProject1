<script>
  import { userUuid } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  let submissionSuccessful = false;
  let submissionEvent = false;
  let jsonData;
  
  const submitAssignmentCode = async () => {
    const data = {
    user: $userUuid,
    assignmentNumber: assignmentID,
    code: userCode,
    };

    // check if user has pending submissions. Tried integrating this into the grading API endpoint but timing did not work
    /*const responsePendingSubmissions = await fetch("/api/submissions-pending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responsePendingSubmissionsJSON = await responsePendingSubmissions.json();
    if (responsePendingSubmissionsJSON.length > 0) {
      alert("Please wait until your last submission has been processed by the grader");
      return;
    };*/
    
    const response = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    jsonData = await response.json();
    console.log(jsonData)
    submissionSuccessful = jsonData.correct;
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
  <div class="bg-red-500 p-2">
    <p>Your submission was not succesful!</p>
    {#await jsonData}
      <p>Awaiting data...</p>
      {:then jsonResponse}
      <p class="pb-2">Error Type: {jsonResponse.errorType}</p>
      <p class="bg-gray-900 text-white p-2 font-mono">{jsonResponse.graderFeedback}</p>
    {/await}
  </div>
{/if}
