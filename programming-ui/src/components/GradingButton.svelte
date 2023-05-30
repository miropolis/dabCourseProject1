<script>
  import { userUuid } from "../stores/stores.js";
  export let assignmentID = 1;
  let userCode = "";
  
  const doSimpleGradingDemo = async () => {
    console.log("Button triggered");
    let data;
    if (userCode === "default") {
      data = {
      user: $userUuid,
      code: `def hello():
  return "Hello"
`,
    };
    } else {
      data = {
      user: $userUuid,
      assignmentNumber: assignmentID,
      code: userCode,
      };
    }

    
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
<textarea bind:value={userCode} class="w-full bg-gray-900 text-white font-mono p-2.5 h-48 border-4 border-black focus:border-4 focus:border-blue-500"></textarea>
<button
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
  on:click={doSimpleGradingDemo}
>
  Do grading demo!
</button>
