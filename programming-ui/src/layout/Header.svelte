<script>
  import { userUuid, points } from "../stores/stores.js";
</script>

<nav class="p-4 mb-0.5 shadow">
  <div class="flow-root">
    <span class="text-4xl text-yellow-600 font-sans mb-2 float-left font-extrabold">Programming Assignments Website</span>
    <span class="font-sans text-lg p-2 font-bold float-right bg-yellow-600 text-white">
      <p>Points:</p>
      <p class="text-2xl">{$points}</p>
    </span>
  </div>
</nav>
