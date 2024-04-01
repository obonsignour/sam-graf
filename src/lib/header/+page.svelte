<script lang="ts">
	// import type { PageData } from './$types'
	// export let data: PageData
	import Selector from '$lib/selector.svelte'
	import { appName, pageTitle } from '$lib/generalStore'
	import type { selectElement } from '$lib/selector.svelte'
	import { goto } from '$app/navigation'

	export let initData: { apps: selectElement[] }

	const onChangeApp = () => {
		console.log('App changed')
		goto(`/Applications/${$appName}`)
	}

	const onSearch = () => {
		goto(`/Applications/${$appName}?search=true`)
	}
</script>

<header>
	<div id="right-section" class="right-section">
		<div>Sami Graf Viewer</div>

		{#await initData.apps}
			<span>Waiting for the list to be downloaded</span>
		{:then apps}
			{#if apps}
				<div class="custom-select">
					<Selector elements={apps} bind:selected={$appName} on:newValueSelectedInCombo={onChangeApp} />
				</div>
			{:else}
				<p>No apps found</p>
			{/if}
		{/await}
		<div class="page-title">{$pageTitle}</div>
	</div>
	<div id="left-section" class="left-section">
		<button on:click={onSearch}>Search</button>
	</div>
</header>

<style>
	header {
		width: auto;
		height: var(--footer-header-height);
		background-color: black;
		color: white;
		display: flex;
		justify-content: space-between; /* Add this line */
		align-items: center;
		padding: 0rem 0.5rem 0 0;
	}

	header .right-section {
		display: flex;
		justify-content: flex-start;
	}

	header > * {
		margin: 0 0.25rem;
	}

	.custom-select {
		margin: 0 1rem;
	}
</style>
