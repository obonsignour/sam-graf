<script lang="ts">
	import type { RawGraph } from '@linkurious/ogma'
	import OgmaComponent from './ogmaComponent/+page.svelte'
	import RightPanel from './rightPanel.svelte'

	export let rawGraph: RawGraph
	let hoveredIds: string[] = []

	// const handleHoveredGraph = (e) => {
	// 	// console.log('Hovered graph:', e.detail.id)
	// }
	// $: console.log('Viewer got: ', hoveredIds)
</script>

<div class="viewer">
	<OgmaComponent {rawGraph} bind:hoveredIds />
	<!---<RightPanel {rawGraph} bind:hoveredIds />-->
</div>

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
