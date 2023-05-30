<script>
  import { userUuid } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  
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
  };

  const getGrading = async () => {

  }
</script>
<textarea bind:value={userCode} class="w-full bg-gray-900 text-white font-mono p-2.5 h-48 border-4 border-black focus:border-4 focus:border-blue-500" placeholder="Write your Pyhton code here..."></textarea>
<button
  class="bg-gray-600 hover:bg-gray-900 text-white font-bold p-4 m-4"
  on:click={submitAssignmentCode}
>
  Submit for grading
</button>
