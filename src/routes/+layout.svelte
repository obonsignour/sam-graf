<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css'
	import OptionsPanel from '$lib/optionsPanel.svelte'
	import { appName } from '$lib/generalStore'
	import type { LayoutData } from './$types'

	export let data: LayoutData
	// $: {
	// 	console.log(typeof $appName)
	// 	console.log($appName === 'undefined')
	// }
</script>

<div class="page">
	<header>
		<div>Sam Graf Viewer</div>
		<div class="custom-select" style="width:200px;">
			<select bind:value={$appName} name="apps" id="app-selector">
				<!-- {console.log('AppName from store:', $appName)} -->
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
	</header>
	<div class="wrapper">
		<OptionsPanel />
		<slot />
	</div>

	<footer>
		<div>Sam Graf Viewer footer</div>
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
