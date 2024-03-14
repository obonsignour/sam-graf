<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css'
	import OptionsPanel from '$lib/optionsPanel.svelte'
	import Selector from '$lib/selector.svelte'
	import { appName, pageTitle } from '$lib/generalStore'
	import type { LayoutData } from './$types'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	onMount(() => {
		console.log('the component has mounted. params:', $page.params, ', slug:', $page.params.appName)
		$appName = $page.params.appName
	})

	export let data: LayoutData
</script>

<div class="page" data-sveltekit-preload-data="tap">
	<header>
		<div>Sami Graf Viewer</div>

		{#await data.apps}
			<span>Waiting for the list to be downloaded</span>
		{:then apps}
			{#if apps}
				<div class="custom-select">
					<Selector elements={apps} bind:selected={$appName} />
				</div>
			{:else}
				<p>No apps found</p>
			{/if}
		{/await}
		<div class="page-title">{$pageTitle}</div>
	</header>
	<div class="wrapper">
		<OptionsPanel />
		<slot />
	</div>

	<footer>
		<div>Sami Graf Viewer footer</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		min-height: 100vh;
		--background-blue: rgb(25, 118, 210);
		--background-pale: rgb(227, 192, 192);
		--hovered: red;
		--footer-header-height: 3rem;
		--background-options-color: #f0f0f0;
	}
	:global(html) {
		font-family: 'Roboto', sans-serif;
		height: 100vh;
	}

	*,
	*:before,
	*:after {
		box-sizing: inherit;
	}

	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	header,
	footer {
		width: auto;
		height: var(--footer-header-height);
		background-color: black;
		color: white;
		display: flex;
		justify-content: space-between; /* Add this line */
		align-items: center;
		padding: 0rem 0.5rem 0 0;
	}

	header {
		justify-content: flex-start;
	}
	.wrapper {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-grow: 1;
		height: 100%;
		overflow: hidden;
		border: 5px solid var(--background-blue);
	}
	.custom-select {
		margin: 0 1rem;
	}
</style>
