<script lang="ts">
	import Ogma, { type RawGraph } from '@linkurious/ogma'
	import { createEventDispatcher } from 'svelte'

	export let rawGraph: RawGraph
	export let hoveredIds: string[]
	let ogma: Ogma
	// const dispatch = createEventDispatcher<{ nodeHovered: string | number }>()

	const setup = (node: HTMLDivElement, graph: RawGraph) => {
		const nodeId = node.getAttribute('id')
		if (nodeId === null) return // check to prevent TypeScript throwing an error on container: node.getAttribute('id')
		ogma = new Ogma({
			container: nodeId,
			graph: graph
		})
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: (node) => node.getData('Name'),
				position: 'bottom',
				color: 'black'
			},
			color: 'white',
			innerStroke: 'black'
		})

		ogma.events
			.on('mouseover', (evt) => {
				if (evt.target) {
					const { target, x, y } = evt
					if (hoveredIds) hoveredIds = []
					hoveredIds[0] = target.getId().toString()
					// dispatch('nodeHovered', { id: target.getId() })
				}
			})
			.on('mouseout', (evt) => {
				if (evt.target) {
					const { target, x, y } = evt
				}
			})
			.on('click', (evt) => {
				if (!evt.target) {
					const { target, x, y } = evt
					if (hoveredIds) hoveredIds = []
				}
			})

		ogma.layouts.forceLink({ locate: true })
		return {
			// update(count: number) {
			// 	return ogma
			// 		.addGraph({
			// 			nodes: [{ id: count }],
			// 			edges: [{ source: 0, target: count }]
			// 		})
			// 		.then(() => ogma.layouts.force({ locate: true }))
			// },
			destroy() {
				// kill ogma instance when the container is removed from DOM
				return ogma.destroy()
			}
		}
	}

	$: {
		// console.log(
		// 	'In Ogma component - ',
		// 	hoveredIds === undefined ? 'No hoveredIds yet' : ('HoveredIds in reactive statement of Component:', hoveredIds)
		// )
		if (ogma != undefined) {
			ogma.getNodes().setSelected(false)
			if (hoveredIds != undefined) {
				const nodes = ogma.getNodes().filter((node) => hoveredIds.includes(node.getId().toString()))
				if (nodes.size > 0) {
					nodes.setSelected(true)
				}
			}
		}
	}
</script>

<div class="ogma-graph">
	{#await rawGraph}
		<div>waiting for graph</div>
	{:then value}
		<div id="container" class="container" use:setup={rawGraph}></div>
	{:catch error}
		<div>error: {error.message}</div>
	{/await}
</div>

<style>
	.ogma-graph {
		display: flex;
		justify-content: center;
		width: 100%;
		height: var(--viewer-height);
		margin: 0;
		border: 1px solid #b30505;
		overflow: auto;
	}
	.container {
		width: 100%;
		height: var(--viewer-height);
		margin: 0;
		padding: 0;
	}
</style>
