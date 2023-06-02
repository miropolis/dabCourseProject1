<script>
  import { userUuid } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  let submissionSuccessful = false;
  let submissionEvent = false;
  
  const submitAssignmentCode = async () => {

    const data = {
    user: $userUuid,
    assignmentNumber: assignmentID,
    code: userCode,
    };

    const responseThrowAway = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const response = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const jsonData = await response.json();
    console.log(jsonData);
    alert(JSON.stringify(jsonData));
    //submissionSuccessful = true;
    //TODO study grader api to see if succesful and adjust return
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
    <p><a href="/assignment-2/">Go to the next assignment</a></p>
  </div>
{/if}
{#if submissionSuccessful == false && submissionEvent}
  <div class="bg-red-500">
    <p>Your submission was not succesful!</p>
    <p>to be error</p>
  </div>
{/if}
