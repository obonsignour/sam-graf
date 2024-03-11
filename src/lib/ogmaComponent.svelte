<script lang="ts">
	import Ogma, { Transformation, type RawGraph } from '@linkurious/ogma'
	import { createEventDispatcher } from 'svelte'

	export let rawGraph: RawGraph
	export let hoveredIds: string[]
	let ogma: Ogma
	// const dispatch = createEventDispatcher<{ nodeHovered: string | number }>()

	const setup = (node: HTMLDivElement, graph: RawGraph) => {
		const nodeId = node.getAttribute('id')
		let communityGrouping: Transformation<any, any>
		if (nodeId === null) return // check to prevent TypeScript throwing an error on container: node.getAttribute('id')
		ogma = new Ogma({
			container: nodeId
		})
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: (node) => node.getData('Name'),
				position: 'bottom',
				color: 'black'
			},
			color: 'white',
			innerStroke: { color: 'black', minVisibleSize: 3 }
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
			.on('doubleclick', (evt) => {
				const target = evt.target
				if (!target) return
				if (!target.isNode) return
				const node = target
				console.log('Double clicked on node:', node.getId())
				if (communityGrouping) {
					communityGrouping.toggle(300).then(() => ogma.layouts.force({}))
				}
			})

		ogma
			.setGraph(graph)
			.then(() => {
				communityGrouping = ogma.transformations.addNodeGrouping({
					groupIdFunction: (node) => node.getData('InternalType'),
					nodeGenerator: (nodes, groupId) => {
						return {
							id: 'special group ' + groupId,
							data: {
								groupId: groupId,
								subNodes: nodes
							},
							attributes: {
								radius: Math.min(
									Math.max(
										nodes.reduce((acc, node) => {
											return acc + 1 //node.getAttribute('radius')
										}, 0),
										15
									),
									50
								),
								text: groupId,
								badges: {
									bottomRight: {
										text: nodes.size
									}
								}
							}
						}
					},
					duration: 300
				})
				return communityGrouping.whenApplied()
			})
			.then(() => ogma.layouts.force({ locate: true }))

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
