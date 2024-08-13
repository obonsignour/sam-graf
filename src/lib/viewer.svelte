<script lang="ts">
	import type { RawGraph } from '@linkurious/ogma'
	import OgmaComponent from './ogmaComponent/+page.svelte'
	import RightPanel from './rightPanel.svelte'
	import { getContext } from 'svelte'
	import { appName, pageTitle } from './generalStore'

	// export let rawGraph: RawGraph
	export let graphData: { rawGraph: RawGraph; id: string }
	let hoveredIds: string[] = []

	// const handleHoveredGraph = (e) => {
	// 	// console.log('Hovered graph:', e.detail.id)
	// }
	// $: console.log('Viewer got: ', hoveredIds)

	const graphType = getContext('graphType')
	const graphId = graphData.id
	$: $pageTitle = `${graphType} ${graphId} for ${$appName}`
</script>

{#if graphData.rawGraph}
	<div class="viewer">
		<OgmaComponent rawGraph={graphData.rawGraph} bind:hoveredIds />
		<RightPanel rawGraph={graphData.rawGraph} bind:hoveredIds />
	</div>
{:else}
	<div>Select an application</div>
{/if}

<style>
	:global(body) {
		--viewer-height: 100%;
	}
	.viewer {
		height: var(--viewer-height);
		width: 100%;
		display: flex;
		flex-grow: 1;
	}
</style>
