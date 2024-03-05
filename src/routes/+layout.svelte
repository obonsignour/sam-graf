<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css'
	import OptionsPanel from '$lib/optionsPanel.svelte'
	import { appName } from '$lib/generalStore'
	import type { LayoutData } from './$types'

	export let data: LayoutData
	$: {
		console.log(typeof $appName)
		console.log($appName === 'undefined')
	}
</script>

<div class="grid-container">
	<nav>
		<div>Sam Graf Viewer</div>
		<div class="custom-select" style="width:200px;">
			<select bind:value={$appName} name="apps" id="app-selector">
				{console.log('AppName from store:', $appName)}
				<option value="default" selected={$appName == 'undefined'}>Select an app</option>
				{#await data.apps}
					<span>Waiting for the list to be downloaded</span>
				{:then apps}
					{#each apps as app}
						<option value={app.appName} selected={app.appName == $appName}>{app.appName}</option>
					{/each}
				{/await}
			</select>
		</div>
	</nav>
	<div class="options">
		<OptionsPanel />
	</div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		min-height: 100vh;
		--background-blue: rgb(25, 118, 210);
		--background-pale: rgb(227, 192, 192);
		--selected: red;
	}
	:global(html) {
		font-family: 'Work Sans', 'Roboto', sans-serif;
		height: 100%;
	}

	.grid-container {
		display: grid;
		grid-template-areas:
			'header header header header header header'
			'options main main main main main'
			'options footer footer footer footer footer';
		grid-template-rows: 1fr 3fr 1fr;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
		gap: 5px;
		background-color: #2196f3;
		max-height: 100vh;
	}

	.options {
		grid-area: options;
	}
	.content {
		grid-area: main;
	}

	nav {
		grid-area: header;
		display: flex;
		justify-content: left;
		background-color: #000000;
		padding: 0.25rem 1rem;
		color: white;
		height: 2rem;
		font-size: 1.25rem;
	}

	.custom-select {
		margin: 0 1rem;
	}
</style>
