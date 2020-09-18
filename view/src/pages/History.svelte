<script>
  import { api, formatTimestamp, auth } from '../lib';
  import store from '../store';
  import Link from '../components/Link.svelte';
  import Meta from '../components/Meta.svelte';
  import Navbar from '../components/Navbar.svelte';

  export let params;

  let user = null;
  auth.fetchUser();
  store.user.subscribe((value) => {
    user = value;
  });

  let failed = false;

  let selected = [];

  $: fetchHistory = async () => {
    return await api
      .get('/page/history', { params: { pageid: params.pageid } })
      .then((resp) => resp.data)
      .catch(() => {});
  };

  function deletePages(pages) {
    pages = pages.map((page) => {
      return {
        pageid: page.pageid,
        ts: page.timestamp,
      };
    });
    api
      .post('/delete_pages', { pages })
      .then((_resp) => {
        failed = false;
        fetchHistory = fetchHistory; // Refresh
      })
      .catch((_err) => {
        failed = true;
      });
  }
</script>

<style>
</style>

<div>
  <Meta
    metadata={{ title: `History of: ${params.pageid}`, robots: 'noindex, nofollow' }} />
  <Navbar />
  <div class="center-main">
    <main class="main">
      <h1 class="title text-2xl mt-4 mb-4 x-border-b">
        <Link to={params.pageid} class="link">{params.pageid}</Link>/history
      </h1>
      <div class="text-sm mb-2 flex items-center">
        <!-- <div class="mr-1">
          <button class="hover:text-gray-600 font-semibold">Diff</button>
        </div> -->
        <div class="mr-8">
          <button
            on:click={() => deletePages(selected)}
            class="hover:text-gray-600 font-semibold">Delete</button>
        </div>
        <div class="flex items-center">
          <span class="text-sm mr-1">As:</span>{#if !!user}
            <span class="text-sm">{user.userid}</span><button on:click|preventDefault={auth.signout} class="ml-4
                text-sm text-gray-600">Sign out</button>
          {:else}
            <span class="text-sm">–</span>
            <Link
              to="signin?next=/{params.pageid}/history"
              class="ml-4 text-sm text-gray-600">
              Sign in
            </Link>
          {/if}
        </div>
        {#if failed}
          <div class="ml-2 text-sm text-red-800">Please sign in.</div>
        {/if}
      </div>
      {#await fetchHistory() then history}
        {#each history.pages as page}
          <div class="flex items-center mb-1">
            <div class="mr-2">
              <input type="checkbox" bind:group={selected} value={page} />
            </div>
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
