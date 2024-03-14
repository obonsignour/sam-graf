<script lang="ts">
	import Ogma, { Transformation, type RawGraph } from '@linkurious/ogma'
	import Selector, { type selectElement } from './selector.svelte'

	// Props
	export let rawGraph: RawGraph
	export let hoveredIds: string[]

	// Internals - Global
	let ogma: Ogma
	let isContentVisible = false //drive the display or not of the content of the grouped nodes
	let isGroupingEnabled = true
	let algo = 'Louvain'
	let level = 1

	const defineGrouping = (): Transformation<any, any> => {
		return ogma.transformations.addNodeGrouping({
			groupIdFunction: (node) => node.getData('groupId'),
			//groupIdFunction: (node) => node.getData('properties.community_level_0_Directed_Louvain_DataGraph_PRODUCTS'),
			nodeGenerator: (nodes, groupId) => {
				return {
					id: 'special group ' + groupId,
					data: {
						groupId: groupId,
						subNodes: nodes
					},
					attributes: {
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

	const setup = (node: HTMLDivElement, graph: RawGraph) => {
		const nodeId = node.getAttribute('id')
		let communityGrouping: Transformation<any, any>
		let communityFlagging: Transformation<any, any>

		if (nodeId === null) return // check to prevent TypeScript throwing an error on container: node.getAttribute('id')
		ogma = new Ogma({
			container: nodeId
		})
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: (node) => node.getData('properties.Name'),
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
				if (communityGrouping) {
					communityGrouping.toggle(300).then(() => ogma.layouts.force({}))
				}
			})

		ogma
			.setGraph(graph)
			.then(() => {
				if (algo === 'None') return
				setIdGroup()
			})
			.then(() => {
				communityGrouping = defineGrouping()
				return communityGrouping.whenApplied()
			})
			.then(() => ogma.layouts.force({ locate: true, charge: 100 }))

		return {
			destroy() {
				return ogma.destroy()
			}
		}
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
			changeLevel()
		}
	}

	const toggleContentVisible = () => {
		if (ogma != undefined) {
			ogma.transformations.getList().forEach((transformation) => {
				transformation.refresh()
			})
		}
	}

	const setIdGroup = () => {
		ogma.getNodes('raw').setData('groupId', (node): string => {
			const communities: number[] = node.getData('properties.' + algo) ? node.getData('properties.' + algo) : [0]
			// console.log('Communities: ', communities, ' new value ', communities.slice(0, level).join('.'))
			return communities.slice(0, Math.min(level, communities.length)).join('.')
		})
	}

	const changeLevel = () => {
		if (ogma != undefined) {
			// console.log('Changing to Level: ', level, ' for algo ', algo)
			if (algo === 'None') return
			setIdGroup()
			ogma.transformations.getList().forEach((transformation) => {
				transformation.enable()
				transformation.refresh()
			})
			ogma.transformations.afterNextUpdate().then(() => {
				ogma.layouts.force({ locate: true, charge: 100 })
			})
		}
	}

	$: {
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
		<div id="toolbar" class="toolbar">
			<button on:click={() => ogma.layouts.force({ locate: true, charge: 100 })}>Force layout</button>
			<button on:click={() => ogma.layouts.forceLink({})}>ForceLink layout</button>
			<button on:click={() => ogma.layouts.hierarchical({})}>Hierarchical layout</button>
			<Selector selected={algo} elementType="algo" elements={algos} on:newValueSelectedInCombo={onChangeAlgo} />
			<div class="custom-checkbox">
				<input type="checkbox" name="content-visible" id="content-visible" bind:checked={isContentVisible} on:change={() => toggleContentVisible()} />
				<label for="content-visible">Show content</label>
			</div>
			<div class="custom-range">
				<label for="scale">Level</label>
				<input type="range" name="leve-scale" id="level-scale" min="1" max="4" step="1" bind:value={level} on:change={() => changeLevel()} />
			</div>
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

	.container {
		width: 100%;
		height: var(--viewer-height);
		margin: 0;
		padding: 0;
	}
</style>
