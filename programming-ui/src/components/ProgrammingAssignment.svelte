<script>
    export let assignmentID = 1;
    const getAssignments = async () => {
        const response = await fetch("/api/assignments");
        return await response.json();
    };
    let assignmentsPromise = getAssignments();
</script>


{#await assignmentsPromise}
<p>Loading Programming Assignment</p>
{:then assignments}
{#if assignments.length == 0}
    <p>No programming assignments available</p>
{:else}
    <h1 class="text-3xl font-bold pb-6 mt-3">Assignment {assignmentID}: {assignments[assignmentID-1].title}</h1>
    <p class="text-lg pb-8">{assignments[assignmentID-1].handout}</p>
{/if}
{/await}
