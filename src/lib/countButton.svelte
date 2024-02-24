<script lang="ts">
	import { count, increment } from './state';
</script>

<button on:click={increment}>Nodes: {$count}</button>
