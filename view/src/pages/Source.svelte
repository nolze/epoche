<script>
  import { api } from "../lib";
  import Navbar from "../components/Navbar.svelte";
  import Meta from "../components/Meta.svelte";

  export let params;

  $: fetchPage = async () => {
    return await api
      .get(`/${params.pageid}/markup`)
      .then(resp => resp.data)
      .catch(() => {});
  };
</script>

<style>

</style>

<div>
  <main>
    {#await fetchPage() then page}
      <Meta metadata={{ title: page.title }} />
      <div class="content">
        <textarea
          value={page.content}
          class="w-full h-screen focus:outline-none" />
      </div>
    {/await}
  </main>
</div>
