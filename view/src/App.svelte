<script>
  import _ from './Global.svelte';

  import qs from 'qs';
  import router from 'page';

  import Page from './pages/Page.svelte';
  import Edit from './pages/Edit.svelte';
  import History from './pages/History.svelte';
  import Source from './pages/Source.svelte';

  import Auth from './pages/Auth.svelte';
  import Search from './pages/Search.svelte';

  import { basepath } from './lib';

  let current = Page;
  let params = {};
  let query = {};

  let load = (ctx, next) => {
    params = ctx.params;
    query = qs.parse(ctx.querystring);

    next();
  };

  router(basepath, basepath + 'MainPage');
  router(basepath + 'signin', load, () => (current = Auth));
  router(basepath + 'signout', load, () => (current = Auth));
  router(basepath + 'search', load, () => (current = Search));
  router(basepath + ':pageid(.*)/edit', load, () => (current = Edit));
  router(basepath + ':pageid(.*)/history', load, () => (current = History));
  router(basepath + ':pageid(.*)/source', load, () => (current = Source));
  router(basepath + ':pageid(.*)', load, () => (current = Page));
  router('/:_(.*)', basepath + 'MainPage');
  router.start();
</script>

<svelte:component this={current} {params} {query} />
