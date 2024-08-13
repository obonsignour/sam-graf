<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import type { PageData } from './$types'

	export let data: PageData
	$: $pageTitle = `DataGraphs for ${$appName}`
</script>

<div class="content">
	{#await data.datagraphs}
		<dialog>Loading datagraphs list</dialog>
	{:then datagraphs}
		{#if datagraphs}
			<div class="header" id="header_id">Datagraph Id</div>
			<div class="header" id="header_name">Datagraph Name</div>
			<div class="header" id="header_name">Computed Models</div>
			{#each datagraphs as datagraph}
				<div id={datagraph.id}><a href="/Applications/{$appName}/DataGraphs/{datagraph.id}">{datagraph.id}</a></div>
				<div id={datagraph.id}><a href="/Applications/{$appName}/DataGraphs/{datagraph.id}">{datagraph.graphName} </a></div>
				<div id={datagraph.id}>
					{#each datagraph.modelNames as modelName}
						<a class="model_name" href="/Applications/{$appName}/Models/{modelName}">{modelName}</a>
					{:else}
						No model
					{/each}
				</div>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.content {
		margin: 1rem;
		display: grid;
		grid-template-columns: 2fr 3fr 3fr;
		height: 100%;
		min-width: 40%;
		max-width: 80%;
		overflow-y: auto;
	}

	.header {
		font-weight: 600;
		font-size: 1.5rem;
	}
	.content .model_name {
		margin-right: 1rem;
	}
</style>
