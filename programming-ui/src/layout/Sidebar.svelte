<script>
import { userUuid } from "../stores/stores.js";
import { onMount } from 'svelte';
let url = ``;
onMount(() => url = window.location.href);
const currentPath = "";

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
    console.log(responseJSON)
    console.log(responseJSON[0].programming_assignment_id)
    return responseJSON;
};

let sidebarPromise = getSidebarContent();
</script>
<!-- TODO: Make sidebar dynamic -->

{#await sidebarPromise}
Loading assignmentsd
{:then sidebar}
    abc {sidebar}
    <div class="text-lg font-semibold">
        <a class={currentPath === "assignment-1/" ? "text-blue-600" : ""} href="/assignment-1/"><p class="hover:bg-gray-200 pl-2 pb-0.5">Assignment 1</p></a>
        <a class={currentPath === "assignment-2/" ? "text-blue-600" : ""} href="/assignment-2/"><p class="hover:bg-gray-200 pl-2 pb-0.5">Assignment 2</p></a>
        <a class={currentPath === "assignment-3/" ? "text-blue-600" : ""} href="/assignment-3/"><p class="hover:bg-gray-200 pl-2 pb-0.5">Assignment 3</p></a>
        this is the url {url} and usuer uuid {$userUuid}
    </div>
{/await}
