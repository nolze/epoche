<script>
  import { onMount } from 'svelte';
  import { router, api, auth } from '../lib';
  import store from '../store';
  import Meta from '../components/Meta.svelte';
  import Link from '../components/Link.svelte';
  import Navbar from '../components/Navbar.svelte';

  export let params;

  let user = null;
  let isSubstantial = false;
  let page = {
    title: null,
    content: null,
  };
  let failed = false;
  let previewPage = null;

  auth.fetchUser();
  store.user.subscribe((value) => {
    user = value;
  });

  $: onMount(async () => {
    let latestPage = await api
      .get('/page/markup', { params: { pageid: params.pageid } })
      .then((resp) => {
        let page = resp.data;
        if (!page.timestamp) isSubstantial = true;
        page = Object.assign(page, {
          title: page.title || params.pageid,
        });
        return page;
      })
      .catch(() => {});
    page = Object.assign(page, latestPage);
  });

  function preview() {
    let data = {
      title: page.title,
      content: page.content,
      isSubstantial: isSubstantial,
    };
    api
      .post('/preview_page', data, {
        params: { pageid: params.pageid, preview: 1 },
      })
      .then((resp) => {
        failed = false;
        previewPage = resp.data;
        location.hash = '#preview';
      })
      .catch((_err) => {
        // console.log(err);
        failed = true;
      });
  }

  function submit() {
    let data = {
      title: page.title,
      content: page.content,
      isSubstantial: isSubstantial,
    };
    api
      .post('/page', data, { params: { pageid: params.pageid } })
      .then((resp) => {
        failed = false;
        router(`/${params.pageid}`);
      })
      .catch((_err) => {
        // console.log(err);
        failed = true;
      });
  }
</script>

<style>
</style>

<div>
  <Meta
    metadata={{ title: `Edit: ${params.pageid}`, robots: 'noindex, nofollow' }} />
  <Navbar />
  <div class="center-main">
    <main class="main">
      {#if !!previewPage}
        <div id="preview" class="shadow px-6 py-4 mb-4">
          <div class="-mb-1 -ml-2">
            <span class="px-2 py-1 rounded text-xs bg-gray-100">Preview</span>
          </div>
          <h1 class="title text-2xl mt-4 mb-4 font-semibold">
            {previewPage.title}
          </h1>
          <div class="content">
            <p>
              {@html previewPage.content}
            </p>
          </div>
        </div>
      {/if}
      <input
        type="text"
        class="title text-2xl mt-4 mb-4 w-full border-b focus:outline-none"
        bind:value={page.title} />
      <div>
        <div class="p-4 my-4 border">
          <textarea
            class="w-full h-64 focus:outline-none"
            bind:value={page.content} />
        </div>
      </div>
      <div class="mb-2 flex items-center">
        <span class="text-sm mr-1">As:</span>{#if !!user}
          <span class="text-sm">{user.userid}</span><button
            on:click|preventDefault={auth.signout}
            class="ml-4
              text-sm text-gray-600">Sign out</button>
        {:else}
          <span class="text-sm">–</span>
          <Link
            to="signin?next=/{params.pageid}/edit"
            class="ml-4 text-sm text-gray-600">
            Sign in
          </Link>
        {/if}
        {#if failed}
          <div class="ml-3 text-sm text-red-800">Please sign in.</div>
        {/if}
      </div>
      <div class="flex items-center">
        <div class="mr-1 text-sm">
          <button
            on:click={preview}
            class="text-sm font-semibold mr-1 text-gray-600 hover:text-gray-700">Preview</button>
        </div>
        <div class="mr-4 text-sm">
          <button
            on:click={submit}
            class="text-sm font-semibold mr-1 text-black hover:text-gray-700">Save</button>
          <span><input
              type="checkbox"
              class="mr-1"
              bind:checked={isSubstantial} />Take snapshot
          </span>
        </div>
        <Link to={params.pageid} class="text-sm link">Cancel</Link>
      </div>
    </main>
  </div>
</div>
