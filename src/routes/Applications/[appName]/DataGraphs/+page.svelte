<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore';
	import GraphListWrapper from '$lib/GraphListWrapper.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let isLoading = true;
	let error: string | null = null;
	
	onMount(() => {
		// Simulate loading for smoother UI transition
		setTimeout(() => {
			isLoading = false;
			// Set the document title based on the app name
			document.title = `${$appName} - DataGraphs`;
		}, 300);
	});
	
	// Update the store with the current page title
	$: $pageTitle = `DataGraphs - ${$appName}`;
</script>

<div class="datagraphs-page" in:fade={{ duration: 200 }}>
	<GraphListWrapper 
		graphType="DataGraph"
		graphRows={data.datagraphs}
		{isLoading}
		{error}
	/>
</div>

<style>
	.datagraphs-page {
		height: 100%;
		width: 100%;
		background-color: rgb(253, 250, 246);
	}
</style>