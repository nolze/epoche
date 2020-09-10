<script>
  import _ from './Global.svelte';

  import qs from 'qs';

  import Page from './pages/Page.svelte';
  import Edit from './pages/Edit.svelte';
  import History from './pages/History.svelte';
  import Source from './pages/Source.svelte';

  import Auth from './pages/Auth.svelte';
  import Search from './pages/Search.svelte';

  import { router } from './lib';

  let current = Page;
  let params = {};
  let query = {};

  let load = (ctx, next) => {
    params = ctx.params;
    query = qs.parse(ctx.querystring);

    next();
  };

  router('/', '/MainPage');
  router('/signin', load, () => (current = Auth));
  router('/signout', load, () => (current = Auth));
  router('/search', load, () => (current = Search));
  router('/:pageid(.*)/edit', load, () => (current = Edit));
  router('/:pageid(.*)/history', load, () => (current = History));
  router('/:pageid(.*)/source', load, () => (current = Source));
  router('/:pageid(.*)', load, () => (current = Page));
  router.start();
</script>

<svelte:component this={current} {params} {query} />
