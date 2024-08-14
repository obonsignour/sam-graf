<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import Viewer from '$lib/viewer.svelte'
	import { setContext } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	setContext('graphId', data.id)
	setContext('graphType', 'Application')

	$: $pageTitle = `Showing the full graph for ${$appName} - max 1,000 nodes`
</script>

{#await data}
	<dialog>Loading data</dialog>
{:then data}
	{#if data.id}
		<Viewer graphData={{ rawGraph: data.rawGraph, id: data.id }} />
	{:else}
		<div>Select an application to display the full graph (limited to 1000 nodes for now)</div>
	{/if}
{/await}

<style>
</style>
