<script>
  import { api, formatTimestamp } from '../lib';
  import Link from '../components/Link.svelte';
  import Meta from '../components/Meta.svelte';
  import Navbar from '../components/Navbar.svelte';

  export let params;

  $: fetchHistory = async () => {
    return await api
      .get(`/${params.pageid}/history`)
      .then((resp) => resp.data)
      .catch(() => {});
  };
</script>

<style>
</style>

<div>
  <Navbar />
  <div class="center-main">
    <main class="main">
      <h1 class="title text-2xl mt-4 mb-4 x-border-b">
        <Link to={params.pageid} class="link">{params.pageid}</Link>/history
      </h1>
      <div class="text-sm mb-1">
        <button class="hover:text-gray-600 mr-1">Diff</button>
        <button class="hover:text-gray-600">Delete</button>
      </div>
      {#await fetchHistory() then history}
        <Meta metadata={{ title: history.title }} />
        {#each history.pages as page}
          <div class="flex items-center mb-1">
            <div class="mr-2"><input type="checkbox" /></div>
            <div class="text-sm text-gray-600 mr-2">
              {formatTimestamp(page.timestamp)}
            </div>
            <div class="text-sm mr-2">{page.title}</div>
            <div class="text-sm text-gray-600">{page.author}</div>
          </div>
        {/each}
      {/await}
    </main>
  </div>
</div>
