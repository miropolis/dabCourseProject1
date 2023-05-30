<script>
    import { userUuid } from "../stores/stores.js";
    const getSubmissions = async () => {
        //TODO rework this as post request which sends both UUID and assignmentID
        const pathGetSubmissions = "/api/submissions/" + $userUuid;
        console.log(pathGetSubmissions);
        const response = await fetch(pathGetSubmissions);
        return await response.json();
    }
    let submissionsPromise = getSubmissions();
</script>


{#await submissionsPromise}
<p>Loading Programming Submissions</p>
{:then submissions}
{#if submissions.length == 0}
    <p>No programming submissions available</p>
{:else}
    {#each submissions as submission}
        <div class="mb-4">
            <p>ID: {submission.id}</p>
            <p>Assignment ID: {submission.programming_assignment_id}</p>
            <p>Code: {submission.code}</p>
            <p>User UUID: {submission.user_uuid}</p>
            <p>Status: {submission.status}</p>
            <p>Grader Feedback: {submission.grader_feedback}</p>
            <p>Correctness: {submission.correct}</p>
            <p>Last Updated: {submission.last_updated}</p>
        </div>
    {/each}
{/if}
{/await}
