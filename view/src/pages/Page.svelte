<script>
  import { api, formatTimestamp } from '../lib';
  import Link from '../components/Link.svelte';
  import Meta from '../components/Meta.svelte';
  import Navbar from '../components/Navbar.svelte';

  export let params;

  let timestamp = '';

  $: fetchPage = async () => {
    return await api
      .get(`/${params.pageid}`)
      .then((resp) => {
        let page = resp.data;
        page = Object.assign(page, {
          title: page.title || params.pageid,
          timestamp: page.timestamp ? formatTimestamp(page.timestamp) : null,
        });
        return page;
      })
      .catch(() => {});
  };
</script>

<style>
</style>

<div>
  <Navbar />
  <div class="center-main">
    <main class="main">
      {#await fetchPage() then page}
        <Meta metadata={{ title: page.title }} />
        <h1 class="title text-2xl mt-4 mb-4 font-semibold">{page.title}</h1>
        <div class="content">
          <p>
            {@html page.content}
          </p>
        </div>
        <div class="bottomline mt-8 text-sm">
          <p class="text-gray-600 italic font-serif">
            Snapshot version: {page.timestamp}
          </p>
        </div>
      <div class="menu mt-1 text-sm flex">
        <Link to="{params.pageid}/edit" class="mr-2 underline">Edit</Link>
        <Link to="{params.pageid}/history" class="mr-2 underline">History</Link>
        <Link to="{params.pageid}/source" class="mr-2 underline">Source</Link>
      </div>
      {/await}
    </main>
  </div>
</div>
