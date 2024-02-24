<script lang="ts">
	import OgmaContainer from '$lib/ogmaContainer.svelte'
	import { sample_graph } from '$lib/sample_graph'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<!-- <h1>{data.post.title}</h1>
<div>{@html data.post.content}</div> -->
<div class="ogma-graph">
	{#await data.graph}
		<div>waiting for graph</div>
	{:then value}
		<!-- promise was fulfilled -->
		<OgmaContainer graph={data.graph} />
	{:catch error}
		<!-- promise was rejected -->
		<div>error: {error.message}</div>
	{/await}
</div>

<style>
	.ogma-graph {
		display: flex;
		width: 100vw;
		height: 85vh;
		margin: 0;
		border: 1px solid #ccc;
	}
</style>
