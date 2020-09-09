<script>
  import router from 'page';

  import { basepath } from '../lib';

  export let to;
</script>

<a
  href="{basepath}{to}"
  target={$$props.target || ''}
  class={$$props.class || ''}><slot /></a>
