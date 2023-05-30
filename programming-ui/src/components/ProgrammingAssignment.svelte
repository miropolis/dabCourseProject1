<script>
    export let assignmentID = 1;
    let userCode = "Write your Python code here...";
    const getAssignments = async () => {
        const response = await fetch("/api/assignments");
        return await response.json();
    };
    const submitTextfield = async () => {
        console.log(userCode);
        userCode = "Write your Python code here...";
    };

    let assignmentsPromise = getAssignments();
</script>


{#await assignmentsPromise}
<p>Loading Programming Assignment</p>
{:then assignments}
{#if assignments.length == 0}
    <p>No programming assignments available</p>
{:else}
    <p class="text-4xl font-semibold pb-6">Assignment {assignmentID}: {assignments[assignmentID-1].title}</p>
    <p class="text-lg pb-4">{assignments[assignmentID-1].handout}</p>
    <p class="pb-10">{assignments[assignmentID-1].test_code}</p>
    <textarea bind:value={userCode} class="w-full bg-gray-900 text-white font-mono p-2.5 h-48 border-4 border-black focus:border-4 focus:border-blue-500"></textarea>
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded" on:click={submitTextfield}>Submit textarea!</button>
{/if}
{/await}
