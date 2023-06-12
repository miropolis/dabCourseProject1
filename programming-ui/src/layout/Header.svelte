<script>
  import { userUuid, points } from "../stores/stores.js";
</script>

<nav class="p-4 mb-0.5 shadow-lg">
  <div class="flow-root">
    <span class="text-4xl text-yellow-600 font-sans mb-2 float-left font-extrabold">Programming Assignments Website</span>
    <span class="font-sans text-lg pt-1 pb-1 pl-4 pr-4 font-bold float-right bg-yellow-600 text-white mr-4 shadow-inner">
      <p>Points:</p>
      <p data-testid="points" class="text-2xl">{$points}</p>
    </span>
  </div>
</nav>
