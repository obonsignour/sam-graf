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
			document.title = `${$appName} - Transactions`;
		}, 300);
	});
	
	// Update the store with the current page title
	$: $pageTitle = `Transactions - ${$appName}`;
</script>

<div class="transactions-page" in:fade={{ duration: 200 }}>
	<GraphListWrapper 
		graphType="Transaction"
		graphRows={data.transactions}
		{isLoading}
		{error}
	/>
</div>

<style>
	.transactions-page {
		height: 100%;
		width: 100%;
		background-color: rgb(253, 250, 246);
	}
</style>