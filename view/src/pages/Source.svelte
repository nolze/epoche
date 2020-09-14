<script>
  import { api } from '../lib';
  import Navbar from '../components/Navbar.svelte';
  import Meta from '../components/Meta.svelte';

  export let params;

  $: fetchPage = async () => {
    return await api
      .get('/page/markup', { params: { pageid: params.pageid } })
      .then((resp) => resp.data)
      .catch(() => {});
  };
</script>

<style>
</style>

<div>
  <main>
    {#await fetchPage() then page}
      <Meta
        metadata={{ title: `Source of: ${params.pageid}`, robots: 'noindex, nofollow' }} />
      <div class="content">
        <textarea
          value={page.content}
          class="w-full h-screen focus:outline-none" />
      </div>
    {/await}
  </main>
</div>
