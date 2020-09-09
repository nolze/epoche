<script>
  import { api, formatTimestamp } from '../lib';
  import Link from '../components/Link.svelte';
  import Meta from '../components/Meta.svelte';
  import Navbar from '../components/Navbar.svelte';

  export let query;
  $: q = query.q;
  $: order = query.s || 'updated';
  $: start = parseInt(query.start) || 0;

  $: fetchResults = async () => {
    return await api
      .get(`/search`, { params: { q, start, s: order } })
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
      <h1 class="title text-2xl mt-4 mb-1">Search for: {q}</h1>
      <div class="mb-4 text-sm flex">
        <span class="mr-1">Sort:</span>
        <Link
          to="search?q={q}&s=updated"
          class={order === 'updated' ? 'font-bold' : ''}>
          Recently updated
        </Link><span class="mx-1">·</span>
        <Link
          to="search?q={q}&s=alphabetical"
          class={order === 'alphabetical' ? 'font-bold' : ''}>
          Alphabetical
        </Link>
      </div>
      {#await fetchResults() then results}
        <Meta metadata={{ title: `Search for: ${q}` }} />
        {#each results.pages as page}
          <div class="mb-4">
            <div>
              <Link to={page.pageid} class="link">{page.title}</Link>
            </div>
            <div class="text-sm">{page.content.slice(0, 120)}...</div>
          </div>
        {/each}
      {/await}
      <div class="text-sm mt-8 flex">
        <Link
          to="search?q={q}&s={order}&start=0"
          class={start === 0 ? 'text-gray-600' : ''}>
          Previous
        </Link><span class="mx-2" />
        <Link to="search?q={q}&s={order}&start=0">Next</Link>
      </div>
    </main>
  </div>
</div>
