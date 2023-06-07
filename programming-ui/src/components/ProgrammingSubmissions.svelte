<script>
    export let assignmentID = 1;
    import { userUuid } from "../stores/stores.js";
    let i = 1;
    const getSubmissions = async () => {
        const data = {
        user: $userUuid,
        assignmentNumber: assignmentID,
        };
        const response = await fetch("/api/submissions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
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
