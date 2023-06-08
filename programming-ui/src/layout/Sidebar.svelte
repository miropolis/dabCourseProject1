<script>
import { userUuid, points } from "../stores/stores.js";
import { onMount } from 'svelte';
let currentPath = ``;
onMount(() => currentPath = window.location.pathname);
let assignmentsToShow = 1;

const getSidebarContent = async () => {
    const data = {user: $userUuid};
    const response = await fetch("/api/submissions-correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const responseJSON = await response.json();
    // Get highest assignment number
    const response2 = await fetch("/api/highest-assignment");
    const highestAssignmentJSON = await response2.json();
    if(responseJSON[0].max_assignment_id) {
        $points = responseJSON[0].max_assignment_id*100;
        assignmentsToShow = responseJSON[0].max_assignment_id + 1;
        if (assignmentsToShow > highestAssignmentJSON[0].count) {
            assignmentsToShow = highestAssignmentJSON[0].count;
        };
    };
    return responseJSON;
};

let sidebarPromise = getSidebarContent();
</script>

{#await sidebarPromise}
Loading assignments
{:then sidebar}
    <div class="text-lg font-semibold">
        {#each {length: assignmentsToShow} as _, i}
            <a class={currentPath === "/assignment-" + (i+1) + "/" ? "text-blue-600" : ""} href={"/assignment-" + (i+1) + "/"}><p class="hover:bg-gray-200 pl-2 pb-0.5">Assignment {i+1}</p></a>
        {/each}
    </div>
{/await}
