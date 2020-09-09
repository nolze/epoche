<script>
  import router from 'page';

  import { api } from '../lib';
  import store from '../store';
  import Navbar from '../components/Navbar.svelte';
  import Meta from '../components/Meta.svelte';

  export let query;

  let next = query.next || '/';

  let userid = null,
    password = null;
  $: failed = false;

  async function auth() {
    await api
      .post(`/auth`, { userid, password })
      .then((resp) => {
        if (resp.status === 200) {
          failed = false;
          let user = resp.data;
          store.user.set(user);
          router(`${next}`);
        } else {
          failed = true;
        }
      })
      .catch((err) => {
        console.error(err);
        failed = true;
      });
  }
</script>

<style>
  .textbox {
    @apply text-sm border border-gray-300 rounded w-64 px-2 py-1;
  }

  .textbox:focus {
    @apply outline-none shadow-outline;
  }
</style>

<div>
  <Navbar />
  <main class="flex px-4 justify-center">
    <div class="mt-4 shadow border rounded px-8 py-6 inline-block">
      <form method="post" on:submit|preventDefault={auth} class="flex flex-col">
        <div>
          <span class="block text-sm mr-2 mb-1 text-gray-600">Username</span>
          <input type="text" bind:value={userid} class="block textbox mb-3" />
        </div>
        <div>
          <span class="block text-sm mr-2 mb-1 text-gray-600">Password</span>
          <input type="password" bind:value={password} class="textbox block" />
        </div>
        {#if failed}
          <div class="mt-3 text-sm text-red-800">Please try again.</div>
        {/if}
        <div class="mt-6 flex justify-end">
          <button
            type="submit"
            class="mr-4 text-sm font-bold hover:text-gray-600">Sign in</button>
          <button
            class="text-sm link"
            on:click={() => history.back()}>Cancel</button>
        </div>
      </form>
    </div>
  </main>
</div>
