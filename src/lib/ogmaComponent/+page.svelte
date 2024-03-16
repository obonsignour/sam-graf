<script lang="ts">
	import Ogma, { Transformation } from '@linkurious/ogma'
	import type { RawGraph, Node, NodeList } from '@linkurious/ogma'
	import { LayoutType, applyLayout, defaultForceOptions, defaultLocateOptions } from './layouting'
	import Selector, { type selectElement } from '$lib/selector.svelte'
	import Layout from '../../routes/+layout.svelte'

	// Props
	export let rawGraph: RawGraph
	export let hoveredIds: string[]

	// Internals - Global
	let ogma: Ogma
	let isContentVisible = false //drive the display or not of the content of the grouped nodes
	let isGroupingEnabled = true
	let algo = 'Louvain'
	let level = 1
	let currentZoomLevel: number = 100

	const setup = (node: HTMLDivElement, graph: RawGraph) => {
		const nodeId = node.getAttribute('id')
		let communityGrouping: Transformation<any, any>
		let communityFlagging: Transformation<any, any>

		if (nodeId === null) return // check to prevent TypeScript throwing an error on container: node.getAttribute('id')
		ogma = new Ogma({
			container: nodeId
		})
		// add styles
		ogma.styles.addNodeRule((node) => !node.isVirtual(), {
			text: {
				content: (node) => node.getData('properties.Name'),
				position: 'bottom',
				color: 'black'
			},
			color: 'white',
			innerStroke: { color: 'gray', width: 1 },
			badges: { bottomRight: { minVisibleSize: 20 } }
		})
		// ogma.styles.addNodeRule((node) => node.isVirtual(), {
		// 	text: {
		// 		content: (node) => 'Group ' + node.getData('groupId'),
		// 		position: 'bottom',
		// 		color: 'black'
		// 	},
		// 	color: 'white',
		// 	innerStroke: { color: 'gray', minVisibleSize: 3 }
		// })

		ogma.events
			.on('mouseover', (evt) => {
				if (evt.target) {
					const { target, x, y } = evt
					if (hoveredIds) hoveredIds = []
					hoveredIds[0] = target.getId().toString()
				}
			})
			.on('mouseout', (evt) => {
				if (evt.target) {
					const { target, x, y } = evt
				}
			})
			.on('click', (evt) => {
				const target = evt.target
				if (!target) {
					const { target, x, y } = evt
					if (hoveredIds) hoveredIds = []
					return
				}
				if (target.isNode) {
					const node = target
					console.log('Clicked on node:', node.getId(), node.getData())
					return
				}
			})
			.on('doubleclick', (evt) => {
				const target = evt.target
				if (!target) return
				if (!target.isNode) return
				const node = target
				console.log('Double clicked on node:', node.getId())
				levelDown(node)
			})
			.on('zoomStart', (evt) => {
				currentZoomLevel = evt.endZoom
			})

		ogma
			.setGraph(graph)
			.then(() => {
				if (algo === 'None') return
				setIdGroupForRawNodes()
			})
			.then(() => {
				communityGrouping = defineGrouping()
				return communityGrouping.whenApplied()
			})
			.then(() => applyLayout(ogma, LayoutType.Force, defaultForceOptions))

		return {
			destroy() {
				return ogma.destroy()
			}
		}
	}

	const defineGrouping = (): Transformation<any, any> => {
		return ogma.transformations.addNodeGrouping({
			groupIdFunction: (node) => node.getData('groupId'),
			//groupIdFunction: (node) => node.getData('properties.community_level_0_Directed_Louvain_DataGraph_PRODUCTS'),
			nodeGenerator: (nodes, groupId) => {
				return {
					id: 'special group ' + groupId,
					data: {
						groupId: groupId,
						subNodes: nodes,
						level: level
					},
					attributes: {
						color: 'lightgray',
						radius: isContentVisible
							? undefined
							: Math.min(
									Math.max(
										nodes.reduce((acc, node) => {
											return acc + 1 //node.getAttribute('radius')
										}, 0),
										15
									),
									50
								),
						outerStroke: { color: 'red', width: 1, minVisibleSize: 3 },
						text: groupId,
						badges: {
							bottomRight: {
								color: 'lightgray',
								text: {
									color: 'gray',
									content: nodes.size
								}
							}
						}
					}
				}
			},
			onCreated: (metaNode, visible, subNodes, subEdges) => {
				if (visible) {
					return ogma.layouts.force({
						nodes: subNodes,
						duration: 0
					}) as unknown as Promise<void>
				}
			},
			showContents: () => isContentVisible,
			enabled: isGroupingEnabled,
			duration: 300
		})
	}

	const algos: selectElement[] = [
		{ value: 'None', label: 'None' },
		{ value: 'Louvain', label: 'Louvain' },
		{ value: 'Leiden', label: 'Leiden' }
	]

	const onChangeAlgo = (event: { detail: any }) => {
		algo = event.detail
		if (ogma != undefined) {
			if (algo === 'None') {
				isGroupingEnabled = false
				ogma.transformations.getList().forEach((transformation) => {
					transformation.disable()
					transformation.refresh()
				})
				ogma.transformations.afterNextUpdate().then(() => {
					ogma.layouts.forceLink({ locate: true })
				})
				return
			}

			isGroupingEnabled = true
			changeLevelForAll()
		}
	}

	const levelDown = (coomunityNode: Node) => {
		if (!coomunityNode.isVirtual()) return
		const currPos = coomunityNode.getPosition()
		const subNodes = coomunityNode.getSubNodes()
		const existingNodes = ogma.getNodes()
		if (subNodes) {
			setIdGroupForNodes(subNodes, coomunityNode.getData('level') + 1)
			ogma.transformations.afterNextUpdate().then(() => {
				const newNodes = ogma.getNodes().filter((node) => !existingNodes.includes(node))
				console.log('Refreshed layout')
				ogma.layouts.force({ nodes: newNodes, incremental: true, ...defaultForceOptions })
			})
		}
	}
	// Set the data (groupId) to be used for the grouping by community.
	// to leave a node always ungrouped, no data groupId should be defined
	const setIdGroupForRawNodes = () => setIdGroupForNodes(ogma.getNodes('raw'))
	const setIdGroupForGroup = (group: Node, forLevel: number = level) => {
		if (group.isVirtual()) {
			const subNodes = group.getSubNodes()
			if (subNodes) {
				setIdGroupForNodes(subNodes, forLevel)
			}
		}
	}
	const setIdGroupForNodes = (nodes: NodeList, forLevel: number = level) => nodes.setData('groupId', (node) => computeCommunityLevel(node, forLevel))
	const computeCommunityLevel = (node: Node, forLevel: number = level) => {
		const communities: number[] = node.getData('properties.' + algo)
		if (communities) return communities.slice(0, Math.min(forLevel, communities.length)).join('.')
		return undefined
	}

	const changeLevelForAll = () => {
		if (ogma != undefined) {
			// console.log('Changing to Level: ', level, ' for algo ', algo)
			if (algo === 'None') return

			setIdGroupForRawNodes()
			ogma.transformations.getList().forEach((transformation) => {
				transformation.enable()
				transformation.refresh()
			})
			ogma.transformations.afterNextUpdate().then(() => {
				ogma.layouts.force(defaultForceOptions)
			})
		}
	}

	const toggleContentVisible = () => {
		if (ogma != undefined) {
			ogma.transformations.getList().forEach((transformation) => {
				transformation.refresh()
			})
		}
	}

	$: {
		if (ogma != undefined) {
			// currentZoomLevel = ogma.view.getZoom() === currentZoomLevel ? currentZoomLevel : ogma.view.getZoom()
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
		<div id="toolbar" class="toolbar">
			<button on:click={() => applyLayout(ogma, LayoutType.Force)}>Force layout</button>
			<button on:click={() => applyLayout(ogma, LayoutType.ForceLink)}>ForceLink layout</button>
			<button on:click={() => applyLayout(ogma, LayoutType.Hierarchical)}>Hierarchical layout</button>
			<Selector selected={algo} elementType="algo" elements={algos} on:newValueSelectedInCombo={onChangeAlgo} />
			<div class="custom-checkbox">
				<input type="checkbox" name="content-visible" id="content-visible" bind:checked={isContentVisible} on:change={() => toggleContentVisible()} />
				<label for="content-visible">Show content</label>
			</div>
			<div class="custom-range">
				<label for="scale">Level</label>
				<input
					type="range"
					name="leve-scale"
					id="level-scale"
					min="1"
					max="4"
					step="1"
					disabled={algo === 'None'}
					bind:value={level}
					on:change={() => changeLevelForAll()}
				/>
			</div>
		</div>
		<div id="zoombar" class="zoombar">
			<button on:click={() => ogma.view.zoomOut({ duration: 200 })}><i class="fa-solid fa-minus"></i></button>
			<button on:click={() => ogma.view.locateGraph(defaultLocateOptions)}><i class="fas fa-crosshairs"></i></button>
			<button on:click={() => ogma.view.zoomIn({ duration: 200 })}><i class="fa-solid fa-plus"></i></button>
			<div>{currentZoomLevel}%</div>
		</div>
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

		overflow: auto;
		position: relative;
	}

	.toolbar {
		position: absolute;
		display: flex;
		flex-direction: column;
		max-width: fit-content;
		overflow: hidden;
		top: 1rem;
		left: 1rem;
		border: 1px solid #b30505;
		background-color: var(--background-options-color);
		padding: 0.25rem;
	}
	.toolbar > * {
		margin: 0.25rem 0;
	}

	.zoombar {
		position: absolute;
		display: flex;
		max-width: fit-content;
		overflow: hidden;
		bottom: 1rem;
		right: 1rem;
		/* border: 1px solid #b30505; */
		background-color: var(--background-options-color);
		padding: 0.25rem;
	}
	.zoombar > * {
		margin: 0.1rem 0;
	}

	.zoombar button {
		margin: 0.1rem 0;
		padding: 0.25rem;
		min-width: 2rem;
		background-color: var(--background-options-color);
		filter: brightness(0.9);
	}

	.container {
		width: 100%;
		height: var(--viewer-height);
		margin: 0;
		padding: 0;
	}
</style>
