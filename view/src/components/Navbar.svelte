<script>
  import Link from '../components/Link.svelte';

  import { router, wikiname } from '../lib';

  let keyword = null;

  function search(ev) {
    router(`/search?q=${encodeURIComponent(keyword)}`);
  }
</script>

<style>
</style>

<nav class="navbar px-6 py-4">
  <div class="flex items-center">
    <h1 class="title text-lg">{wikiname}</h1>
    <div class="inline-block flex-grow flex items-center w-auto">
      <div class="flex-grow">
        <div class="max-w-lg" />
      </div>
      <div class="text-sm mx-2">
        <Link to="" class="underline">Top</Link>
      </div>
      <div class="text-sm mx-2">
        <Link to="search?q=*{'&'}ord=updated" class="underline">Recent Changes</Link>
      </div>
      <div class="text-sm mx-2">
        <Link to="search?q=*{'&'}ord=alphabetical" class="underline">Index</Link>
      </div>
      <form on:submit|preventDefault={search}>
        <input
          bind:value={keyword}
          type="text"
          placeholder="Search"
          class="ml-2 text-sm border border-gray-300 rounded hidden
            md:inline-block w-64 px-2 py-1 focus:outline-none
            focus:shadow-outline" />
      </form>
    </div>
  </div>
</nav>
