<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import type { PageData } from './$types'

	export let data: PageData
	$: $pageTitle = `Models for ${$appName}`
</script>

<div class="content">
	{#await data.modelgraphs}
		<dialog>Loading models list</dialog>
	{:then modelgraphs}
		{#if modelgraphs}
			<div class="header" id="header_id">Datagraph Id</div>
			<div class="header" id="header_name">Datagraph Name</div>
			{#each modelgraphs as modelgraph}
				<div id={modelgraph.modelName}><a href="/Applications/{$appName}/Models/{modelgraph.modelName}">{modelgraph.modelName}</a></div>
				<div id={modelgraph.modelName}><a href="/Applications/{$appName}/Models/{modelgraph.modelName}">{modelgraph.linkTypes} </a></div>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.content {
		margin: 1rem;
		display: grid;
		grid-template-columns: 2fr 3fr;
		height: 100%;
		min-width: 40%;
		max-width: 80%;
		overflow-y: auto;
	}

	.header {
		font-weight: 600;
		font-size: 1.5rem;
	}
</style>
