<script>
    const getAssignments = async () => {
        const response = await fetch("/api/assignments");
        return await response.json();
    };

    let assignmentsPromise = getAssignments();
</script>


{#await assignmentsPromise}
<p>Loading Programming Assignments</p>
{:then assignments}
{#if assignments.length == 0}
    <p>No programming assignments available</p>
{:else}
    {#each assignments as assignment}
        <p>Assignment title: {assignment.title}</p>
        <p>Assignment number: {assignment.assignment_order}</p>
        <p>Handout: {assignment.handout}</p>
        <p>Test code: {assignment.test_code}</p>
    {/each}
{/if}
{/await}
