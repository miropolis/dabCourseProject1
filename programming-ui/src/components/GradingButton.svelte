<script>
  import { userUuid, points, highestAssignment } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  let submissionEvent = false;
  let submissionGraded = false;
  let gradingResult;
  let submissionData;
  
  const submitAssignmentCode = async () => {
    submissionGraded = false;
    const data = {
      user: $userUuid,
      assignmentNumber: assignmentID,
      code: userCode,
    };

    // check if user has pending submissions. Tried integrating this into the grading API endpoint but timing did not work
    const responsePendingSubmissions = await fetch("/api/submissions-pending", {
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
    };
    
    const response = await fetch("/api/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    submissionData = await response.json();

    if (submissionData.alreadyGraded) {
      gradingResult = {
        id: submissionData.id,
        correct: submissionData.correct,
        errorType: submissionData.errorType,
        graderFeedback: submissionData.graderFeedback,
      };
      submissionGraded = true;
      return
    }

    submissionEvent = true;

    // Get Grading
    gradingResult = await getGrading(submissionData.id);
    submissionEvent = false;
    submissionGraded = true;

    if (gradingResult.correct) {
      $points = $points + 100;
    };

  };

  const getGrading = async (submissionID) => {
    const data = {
    id: submissionID,
    };
    const response = await fetch ("/api/submission-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  };
</script>
<textarea bind:value={userCode} class="w-full bg-gray-900 text-white font-mono p-2.5 h-48 border-4 border-black focus:border-4 focus:border-yellow-600" placeholder="Write your Python code here..."></textarea>
<button
  class="bg-yellow-600 hover:bg-yellow-900 text-white font-bold p-4 mt-4 mb-8"
  on:click={submitAssignmentCode}
>
  Submit for grading
</button>
{#if submissionEvent}
  <div class="bg-gray-400 mb-2 p-2">
    <p>Your code has been submitted!</p>
    <p class="pb-2">ID: {submissionData.id}</p>
  </div>
{/if}

{#if submissionGraded}
  {#if gradingResult.correct}
  <div class="bg-green-600 p-2">
    <p>Your submission was successful!</p>
    {#if $highestAssignment >= assignmentID +1}
      <p><a href="/assignment-{assignmentID+1}/">Go to the next assignment</a></p>
    {:else}
      <p>Congratulations! You finished all assignments.</p>
    {/if}
  </div>
  {:else}
  <div class="bg-red-500 p-2">
    <p>Your submission was not successful!</p>
    <p class="pb-2">ID: {gradingResult.id}</p>
    <p class="pb-2">Error Type: {gradingResult.errorType}</p>
    <p class="bg-gray-900 text-white p-2 font-mono">{gradingResult.graderFeedback}</p>
   </div>
  {/if}
{/if}