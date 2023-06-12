<script>
    export let assignmentID = 1;
    import { userUuid } from "../stores/stores.js";
    let showSubmissions = false;
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

    const toggleSubmissions = () => {
        if (showSubmissions) {
            showSubmissions = false;
        } else {
            showSubmissions = true;
        };
    };

    let submissionsPromise = getSubmissions();
</script>



    <button on:click={toggleSubmissions} class="flow-root mt-8 p-2 w-full bg-gray-200 border-2 border-yellow-600 shadow-lg">
    <span class="text-xl font-bold text-yellow-600 float-left">Past Submissions:</span>
    <span class="float-right">
        <svg class="mr-2 fill-yellow-600" fill="#000000" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/></svg>
    </span>
    </button>


{#await submissionsPromise}
{#if showSubmissions}
    <p>Loading past programming submissions</p>
{/if}
{:then submissions}
{#if showSubmissions}
{#if submissions.length == 0}
    <div class="bg-gray-100 p-2 border-2 border-t-0 border-yellow-600 mb-8">
        <p>No past programming submissions available</p>
    </div>
{:else}
    <div class="bg-gray-100 p-2 border-2 border-t-0 border-yellow-600 mb-8">
    {#each [...submissions].reverse() as submission}
        <div class="mb-4 pl-2 pr-2">
            <p>ID: {submission.id}</p>
            <p>Assignment ID: {submission.programming_assignment_id}</p>
            <p>Code: {submission.code}</p>
            <p>Status: {submission.status}</p>
            <p>Grader Feedback: {submission.grader_feedback}</p>
            <p>Correctness: {submission.correct}</p>
            <p>Last Updated: {submission.last_updated}</p>
        </div>
    {/each}
    </div>
{/if}
{/if}
{/await}
