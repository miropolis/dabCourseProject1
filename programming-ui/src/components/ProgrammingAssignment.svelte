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
    <p class="text-4xl font-semibold pb-6">Assignment {assignmentID}: {assignments[assignmentID-1].title}</p>
    <p class="text-lg pb-4">{assignments[assignmentID-1].handout}</p>
    <p class="pb-10">{assignments[assignmentID-1].test_code}</p>
{/if}
{/await}
