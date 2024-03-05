<script lang="ts">
	import type { RawGraph } from '@linkurious/ogma'
	import OgmaComponent from './ogmaComponent.svelte'
	import RightPanel from './rightPanel.svelte'

	export let rawGraph: RawGraph
	let hoveredIds: [string] = ['']

	const getNodesAsList = (graph: RawGraph) => {
		const nodes = graph.nodes
		return nodes.map((node) => {
			return {
				id: node.id.toString(),
				rowData: { name: node.data.Name, type: node.data.Type, fullName: node.data.FullName }
			}
		})
	}
	const getList = (graph: RawGraph) => {
		const nodes = getNodesAsList(graph)
		// const edges = getEdges(graph)
		return { nodes }
	}

	// const handleHoveredGraph = (e) => {
	// 	// console.log('Hovered graph:', e.detail.id)
	// }
	$: console.log('Viewer got: ', hoveredIds)
</script>

<div class="viewer">
	<OgmaComponent {rawGraph} bind:hoveredIds />
	<RightPanel data={getList(rawGraph)} bind:hoveredIds />
</div>

<style>
	.viewer {
		display: grid;
		grid-template-columns: 3fr 1fr;
	}
	/* .viewer > * {
		flex: 1;
	}
	.viewer > .ogma-graph {
		flex: 3;
	}
	.viewer > .right-panel {
		flex: 1;
		min-width: 50rem;
	} */
</style>
