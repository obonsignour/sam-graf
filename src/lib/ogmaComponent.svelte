<script lang="ts">
	import Ogma, { type RawGraph } from '@linkurious/ogma'
	import { count } from '$lib/state'

	export let rawGraph: RawGraph

	function setup(node: HTMLDivElement, graph: RawGraph) {
		const nodeId = node.getAttribute('id')
		if (nodeId === null) return // check to prevent TypeScript throwing an error on container: node.getAttribute('id')
		const ogma = new Ogma({
			container: nodeId,
			graph: graph
		})
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: (node) => node.getData('Name'),
				position: 'center',
				color: 'white'
			}
		})

		ogma.layouts.force({ locate: true })
		return {
			update(count: number) {
				return ogma
					.addGraph({
						nodes: [{ id: count }],
						edges: [{ source: 0, target: count }]
					})
					.then(() => ogma.layouts.force({ locate: true }))
			},
			destroy() {
				// kill ogma instance when the container is removed from DOM
				return ogma.destroy()
			}
		}
	}
</script>

<div class="ogma-graph">
	{#await rawGraph}
		<div>waiting for graph</div>
	{:then value}
		<div id="container" use:setup={rawGraph}></div>
	{:catch error}
		<div>error: {error.message}</div>
	{/await}
</div>

<style>
	.ogma-graph {
		display: flex;
		width: 90vw;
		height: 90vh;
		margin: 0;
		border: 1px solid #043917;
	}
	#container {
		width: 100%;
		height: 100%;
		margin: 0;
		border: 1px solid #d00808;
	}
</style>
