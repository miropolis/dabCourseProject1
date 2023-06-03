<script>
    export let assignmentID = 1;
    import { userUuid } from "../stores/stores.js";
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

    const performRedisTests = async () => {
        const data = {
        method: "Add to stream",
        parameter: "test-message-2",
        };

        await fetch("/api/redis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    };

    let submissionsPromise = getSubmissions();
</script>

<button
  class="bg-gray-600 hover:bg-gray-900 text-white font-bold p-4 m-4"
  on:click={performRedisTests}
>
  Perform redis tests!
</button>

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
