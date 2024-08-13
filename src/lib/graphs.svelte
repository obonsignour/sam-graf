<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import type { GraphListRow } from './customTypes'

	export let graphListData: { graphType: string; graphRows: GraphListRow[] }

	const { graphType, graphRows } = graphListData
	$: $pageTitle = `${graphType} for ${$appName}`
</script>

<div class="content">
	{#await graphRows}
		<dialog>Loading {graphType} list</dialog>
	{:then graphRows}
		<h1>{graphType}</h1>
		{#if graphRows}
			<div class="header" id="header_id">Id</div>
			<div class="header" id="header_name">Name</div>
			<div class="header" id="header_models">Computed Models</div>
			{#each graphRows as graphRow}
				<div id={graphRow.id}><a href="/Applications/{$appName}/{graphType}s/{graphRow.id}">{graphRow.id}</a></div>
				<div id={graphRow.id}><a href="/Applications/{$appName}/{graphType}s/{graphRow.id}">{graphRow.graphName} </a></div>
				<div id={graphRow.id}>
					{#each graphRow.modelNames as modelName}
						<a class="model_name" href="/Applications/{$appName}/Models/{modelName}">{modelName}</a>
					{:else}
						No model
					{/each}
				</div>
			{/each}
		{:else}
			<div>No {graphType}</div>
		{/if}
	{/await}
</div>

<style>
	.content {
		margin: 1rem;
		display: grid;
		grid-template-columns: 1fr 2fr 3fr;
		grid-column-gap: 1rem;
		height: 100%;
		min-width: 40%;
		/* max-width: 90%; */
		overflow-y: auto;
	}
	.content h1 {
		grid-column: span 3;
	}
	.header {
		font-weight: 600;
		font-size: 1.5rem;
	}
	.content .model_name {
		margin-right: 1rem;
	}
</style>
