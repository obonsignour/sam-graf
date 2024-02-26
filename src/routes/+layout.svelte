<script lang="ts">
	import OptionsPanel from '$lib/optionsPanel.svelte'
	import PageHeader from '$lib/pageHeader.svelte'
	import type { LayoutData } from './$types'

	// export let data: LayoutData
</script>

<PageHeader />
<div class="content">
	<OptionsPanel />
	<slot />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		min-height: 100vh;
	}
	:global(html) {
		font-family: 'Work Sans', 'Roboto', sans-serif;
		height: 100%;
	}

	.content {
		display: grid;
		grid-template-columns: 1fr 3fr;
		grid-template-rows: auto;
	}
</style>
