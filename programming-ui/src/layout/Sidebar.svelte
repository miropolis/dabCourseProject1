<script>
import { userUuid, points, highestAssignment } from "../stores/stores.js";
import { onMount } from 'svelte';
let currentPath = ``;
onMount(() => currentPath = window.location.pathname);
let assignmentsToShow = 1;
let highestAssignmentJSON;

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
    highestAssignmentJSON = await response2.json();
    $highestAssignment = highestAssignmentJSON[0].count;
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
<nav>
{#await sidebarPromise}
<div class="text-2xl font-semibold pt-4">
Loading assignments
</div>
{:then sidebar}
    <div class="text-2xl font-semibold pt-3">
        {#each {length: ($points/100+1 > highestAssignmentJSON[0].count ? highestAssignmentJSON[0].count : $points/100+1)} as _, i}
            <a class={currentPath === "/assignment-" + (i+1) + "/" ? "text-yellow-600 font-bold" : ""} href={"/assignment-" + (i+1) + "/"}><p class="hover:bg-gray-200 pl-4 pb-1">Assignment {i+1}</p></a>
        {/each}
    </div>
{/await}
</nav>