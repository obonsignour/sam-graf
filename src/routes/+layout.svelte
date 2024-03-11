<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css'
	import OptionsPanel from '$lib/optionsPanel.svelte'
	import { appName } from '$lib/generalStore'
	import { graphName } from '$lib/generalStore'
	import type { LayoutData } from './$types'

	export let data: LayoutData
	// $: {
	// 	console.log(typeof $appName)
	// 	console.log($appName === 'undefined')
	// }
	let appSelected = $appName
</script>

<div class="page">
	<header>
		<div>Sami Graf Viewer</div>

		<!-- App selection -->
		<div class="custom-select" style="width:200px;">
			{#await data.apps}
				<span>Waiting for the list to be downloaded</span>
			{:then apps}
				<select bind:value={appSelected} name="apps" id="app-selector" on:change={() => ($appName = appSelected)}>
					<option value="default" selected>Select an app</option>
					{#each apps as app}
						<option value={app.appName} selected={app.appName == $appName}>{app.appName}</option>
					{/each}
				</select>
			{/await}
		</div>

        <!-- DataGraph or Transaction selection -->
        <div class="custom-select" style="width:200px;">
            <select bind:value={graphTypeSelected} name="graphTypeSelected" id="graph-type-selector">
                <option value="default" selected>Select Graph Type</option>
                <option value="DataGraphs">DataGraphs</option>
                <option value="Transactions">Transactions</option>
            </select>
        </div>

		<!-- Graph selection -->
		<div class="custom-select" style="width:200px;">
			{#await data.apps}
				<span>Waiting for the list to be downloaded</span>
			{:then apps}
				<select bind:value={graphSelected} name="graphSelected" id="graph-selector" on:change={() => ($graphName = graphSelected)}>
					<option value="default" selected>Select a Graph</option>
					{#each apps as app}
						<option value={app.graphName} selected={app.graphName == $graphName}>{app.graphName}</option>
					{/each}
				</select>
			{/await}
		</div>

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
