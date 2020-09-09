<script>
  import { router, basepath } from '../lib';

  export let to;
</script>

<a
  href="{basepath}{to}"
  target={$$props.target || ''}
  class={$$props.class || ''}><slot /></a>
