<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css'
	import LeftPanel from '$lib/leftPanel.svelte'
	import Selector from '$lib/selector.svelte'
	import { appName, pageTitle } from '$lib/generalStore'
	import SearchDialog from '$lib/searchDialog/+page.svelte'
	import Header from '$lib/header/+page.svelte'
	import type { LayoutData } from './$types'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	onMount(() => {
		console.log('the component has mounted. params:', $page.params, ', slug:', $page.params.appName)
		$appName = $page.params.appName
	})
	let isSearchOpened: boolean = false
	const openSearch = () => {
		isSearchOpened = true
	}
	export let data: LayoutData
</script>

<div class="page" data-sveltekit-preload-data="tap">
	<Header initData={data.apps != undefined ? { apps: data.apps } : { apps: [] }} />
	<div class="wrapper">
		<LeftPanel />
		<slot {isSearchOpened} />
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

	.wrapper {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-grow: 1;
		height: 100%;
		overflow: hidden;
		border: 5px solid var(--background-blue);
	}
</style>
