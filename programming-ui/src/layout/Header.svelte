<script>
  import { userUuid } from "../stores/stores.js";
</script>

<nav class="p-4 mb-4 shadow">
  <div class="flow-root">
    <span class="text-4xl text-gray-700 font-sans mb-2 float-left font-extrabold">Programming Assignments Website</span>
    <span class="font-sans text-s float-right">{$userUuid}</span>
  </div>
</nav>
