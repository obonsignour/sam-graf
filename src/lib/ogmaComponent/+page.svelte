<script lang="ts">
	import Ogma, { Transformation } from '@linkurious/ogma'
	import type { RawGraph, Node, NodeList, Edge, NodeId, Color } from '@linkurious/ogma'
	import { LayoutType, applyLayout, defaultForceOptions, defaultLocateOptions } from './layouting'
	import Selector, { type selectElement } from '$lib/selector.svelte'
	import AlgoLaunchPad from '$lib/algoLaunchPad.svelte'
	import MetricsModal from '$lib/MetricsModal.svelte'
	import NodeDetailsPanel from '$lib/NodeDetailsPanel.svelte'
	import type { LinkTypes } from '$lib/customTypes'
	import { page } from '$app/stores'
	import { getContext, onMount } from 'svelte'
	//import { startNodesStore, endNodesStore } from '$lib/generalStore'
	import LoggerPanel from '$lib/LoggerPanel.svelte'

	// Props
	export let rawGraph: RawGraph
	export let hoveredIds: string[]

	// Internals - Global
	let ogma: Ogma
	let isContentVisible = false //drive the display or not of the content of the grouped nodes
	let isGroupingEnabled = true
	let algo = 'Leiden'
	let level = 1
	let currentZoomLevel: number = 100

	let metricsModalOpen = false
	let selectedGroupNodes: NodeList | null = null
	let selectedGroupingNode: Node | null = null;

	let nodeDetailsPanelOpen = false
	let selectedNode: Node | null = null

	// For start and end nodes
	let startNodes: string[] = [];
	let endNodes: string[] = [];
	let nodesOfInterestLoaded = false;
	let isLoadingNodesOfInterest = false;

	let loggerPanelOpen = false

	// Get parameters directly from the page store
	const graphType = getContext('graphType') //|| 'Transaction'
	const graphId = getContext('graphId') //|| $page.params.transactionId || $page.params.datagraphId
	// Get appName from page params, which we know is available
	const appName = $page.params.appName

	// Log all values for debugging
	console.log('Page params:', $page.params)
	console.log('Using values:', { appName, graphType, graphId })

	// For manual grouping 
	let groupCount = 1
	const groups = new Map<NodeId, string>()
	const colors = new Map<NodeId, string>()
	const fixedColor = 'green'

	// Function to fetch nodes of interest from the server
	async function fetchNodesOfInterest() {
		if (isLoadingNodesOfInterest) return;
		
		isLoadingNodesOfInterest = true;
		try {
			// Ensure consistent pluralization for all graph types
			// Extract the base graph type (removing 's' if it already exists)
			const baseGraphType = graphType.endsWith('s') 
			? graphType.slice(0, -1) 
			: graphType;
			
			// Always add 's' to ensure plural form
			const graphTypeEndpoint = baseGraphType + 's';
			
			console.log(`Fetching nodes of interest for ${appName}/${graphTypeEndpoint}/${graphId}`);
			
			// Use the correct endpoint path that matches your server route
			const response = await fetch(`/API/nodesOfInterest/${appName}/${baseGraphType}/${graphId}`);
			if (!response.ok) {
			throw new Error(`Error fetching nodes of interest: ${response.statusText}`);
			}
			
			const data = await response.json();
			startNodes = data.startNodes;
			endNodes = data.endNodes;
			
			console.log('Fetched start nodes:', startNodes);
			console.log('Fetched end nodes:', endNodes);
			
			nodesOfInterestLoaded = true;
			
		} catch (error) {
			console.error('Failed to fetch nodes of interest:', error);
			// Fall back to the computed approach if the API fails
			const { startNodes: computed_startNodes, endNodes: computed_endNodes } = computeStartAndEndNodes(rawGraph);
			startNodes = computed_startNodes;
			endNodes = computed_endNodes;
		} finally {
			isLoadingNodesOfInterest = false;
			nodesOfInterestLoaded = true;
		}
	}

	// Keep the existing computeStartAndEndNodes function as a fallback
	function computeStartAndEndNodes(graph: RawGraph): { startNodes: string[]; endNodes: string[] } {
		const startNodes: string[] = []
		const endNodes: string[] = []

		if (!graph || !graph.nodes) {
			console.error('Invalid graph structure', graph)
			return { startNodes, endNodes }
		}

		graph.nodes.forEach((node: Node) => {
			if (node.data.properties?.StartingPoint === true) startNodes.push(String(node.id))
			if (node.data.properties?.EndingPoint === true) endNodes.push(String(node.id))
		})

		// Log found nodes
		console.log('Start nodes from properties:', startNodes);
		console.log('End nodes from properties:', endNodes);

		return { startNodes, endNodes }
	}

	// Get initial values from properties (will be overridden by fetch if successful)
	const initialNodeValues = computeStartAndEndNodes(rawGraph);
	startNodes = initialNodeValues.startNodes;
	endNodes = initialNodeValues.endNodes;

	// Log loading transaction details for debugging
	console.log(`Loading transaction: ${appName} ${graphId} ${graphType}`);

	const setup = (node: HTMLDivElement, graph: RawGraph) => {
		const nodeId = node.getAttribute('id')
		let communityGrouping: Transformation<any, any>
		let groupingInstance: Transformation<any, any>; 

		if (nodeId === null) return
		ogma = new Ogma({
			container: nodeId
		})

		console.log('Graph:', graph)
		console.log('Initial Start Nodes:', startNodes)
		console.log('Initial End Nodes:', endNodes)

		// Nodes style
		ogma.styles.addNodeRule((node) => !node.isVirtual(), {
			text: {
				content: (node) => node.getData('properties.Name'),
				position: 'center',
				color: 'black',
				maxLineLength: 140, // truncate
				size: 12,
				//backgroundColor: '#444',
				minVisibleSize: 5
			},
			// Set color based on node type
			color: (node) => {
				const nodeId = String(node.getId()) // Get the node's ID

				// Check if the node is a start node
				if (startNodes.includes(nodeId)) {
					return 'green' // Set color to green for start nodes
				}
				// Check if the node is an end node
				else if (endNodes.includes(nodeId)) {
					return 'red' // Set color to red for end nodes
				}
				// Default color for other nodes
				return 'grey'
			},
			// innerStroke: { color: 'gray', width: 1 },
			badges: { bottomRight: { minVisibleSize: 20 } }
		})

		// Edges style
		ogma.styles.addEdgeRule({
			text: {
				//content: edge => 'test ' + edge.getId()
				//content: (edge) => edge.getData('properties.id') + '-' + edge.getData('type')
				content: (edge) => edge.getData('type')
			},
			shape: {
				body: () => 'line',
				style: () => 'plain',
				//head: () => null,
				//tail: () => 'arrow'
				head: () => 'arrow',
				tail: () => null
			}
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
					// Close node details panel when clicking on empty space
					nodeDetailsPanelOpen = false
					selectedNode = null
					return
				}
				// Right-click handler for group nodes
				if (evt.button === 'right' && target && target.isVirtual()) {
					// Get the nodes in this group
					selectedGroupNodes = target.getSubNodes()
					selectedGroupingNode = target
					metricsModalOpen = true
					
					// Prevent default context menu
					//evt.preventDefault()
				}
				// Handle regular click for showing node details
				if (target.isNode) {
					selectedNode = target
					// Only show details panel for non-virtual (actual) nodes
					if (!target.isVirtual()) {
						nodeDetailsPanelOpen = true
					}
					console.log('Clicked on node:', target.getId(), target.getData())
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
			.on('dragEnd', ({ target }) => {
				if (!target || !target.isNode) return;
				const parent = target.getMetaNode();
				const { x, y } = (parent || target).getPositionOnScreen();
				const r =
					Number((parent || target).getAttribute('radius')) * ogma.view.getZoom();

				const overlapNodes = ogma.getNodes().filter(node => {
					const pos = node.getPositionOnScreen();
					const dist =
					Ogma.geometry.distance(x, y, pos.x, pos.y) -
					+node.getAttribute('radius') * ogma.view.getZoom();
					return dist < r;
				});

				if (overlapNodes.size < 2) return;

				const groupid =
					overlapNodes
					.map(node => (node.isVirtual() ? node.getId() : groups.get(node.getId())))
					.filter(e => e)[0] || `group-${groupCount++}`;
				if (!colors.has(groupid)) {
					colors.set(groupid, fixedColor);
				}
				overlapNodes.forEach(node => {
					groups.set(node.getId(), groupid as string);
				});
				//grouping.refresh();
				if (groupingInstance) {
					groupingInstance.refresh();
				}
			})
		ogma
			.setGraph(graph)
			.then(() => {
				if (algo === 'None') return
				setIdGroupForRawNodes()
			})
			.then(() => {
				communityGrouping = defineGrouping()
				groupingInstance = grouping()
				return communityGrouping.whenApplied()
			})
			// Layout when loading the page here
			.then(() => applyLayout(ogma, LayoutType.Force, defaultForceOptions))
			// Fetch nodes of interest after initial layout
			.then(() => {
				// Fetch nodes of interest from the server
				fetchNodesOfInterest();
			});

		return {
			destroy() {
				return ogma.destroy()
			}
		}
	}

	// Apply Sami layout with current start/end nodes
	const applySamiLayout = () => {
		console.log("Applying Sami layout with:", { startNodes, endNodes });
		if (ogma) {
			// If we don't have start/end nodes yet, try to fetch them first
			if ((startNodes.length === 0 || endNodes.length === 0) && !isLoadingNodesOfInterest) {
				fetchNodesOfInterest().then(() => {
					applyLayout(ogma, LayoutType.Sami, { entryNodes: startNodes, exitNodes: endNodes });
				});
			} else {
				applyLayout(ogma, LayoutType.Sami, { entryNodes: startNodes, exitNodes: endNodes });
			}
		}
	}
	
	// Apply Sami layout without radius with current start/end nodes
	const applySamiNoRLayout = () => {
		console.log("Applying SamiNoR layout with:", { startNodes, endNodes });
		if (ogma) {
			// If we don't have start/end nodes yet, try to fetch them first
			if ((startNodes.length === 0 || endNodes.length === 0) && !isLoadingNodesOfInterest) {
				fetchNodesOfInterest().then(() => {
					applyLayout(ogma, LayoutType.SamiNoR, { entryNodes: startNodes, exitNodes: endNodes });
				});
			} else {
				applyLayout(ogma, LayoutType.SamiNoR, { entryNodes: startNodes, exitNodes: endNodes });
			}
		}
	}

	const grouping = (): Transformation<any, any> => {
		return ogma.transformations.addNodeGrouping({
			selector: node => groups.has(node.getId()),
			groupIdFunction: node => groups.get(node.getId())!,
			nodeGenerator: (nodes, id) => ({ id }),
			showContents: true,
			onGroupUpdate: (_, nodes) =>
				ogma.layouts.force({
				nodes,
				edgeStrength: 2,
				gravity: 0.1
				})
		})
	}
	
	const groupingLevelColors = ['blue', 'green', 'orange', 'purple']

	const defineGrouping = (): Transformation<any, any> => {
	return ogma.transformations.addNodeGrouping({
		groupIdFunction: (node) => node.getData('groupId'),
		nodeGenerator: (nodes, groupId) => {
		const level = nodes.get(0).getData('level') || 0
		const levelColorIndex = Math.min(level - 1, groupingLevelColors.length - 1)
		
		return {
			id: 'special group ' + groupId,
			data: {
			groupId: groupId,
			subNodes: nodes,
			level: level
			},
			attributes: {
			color: 'white',
			radius: isContentVisible
				? undefined
				: Math.min(
					Math.max(
					nodes.reduce((acc, node) => {
						return acc + 1
					}, 0),
					15
					),
					50
				),
			outerStroke: { 
				color: groupingLevelColors[levelColorIndex], 
				width: 1, 
				minVisibleSize: 3 
			},
			text: {
				content: groupId,
				position: 'center',
				color: 'black',
				maxLineLength: 140,
				size: 12,
				minVisibleSize: 5
			},
			badges: {
				bottomRight: {
				color: 'white',
				text: {
					color: 'gray',
					content: nodes.size
				}
				}
			}
			}
		}
		},
			separateEdgesByDirection: true,
			edgeGenerator: (edgeList) => {
				const combinedId = edgeList.getId().join('-')
				const combinedTypes = Array.from(new Set(edgeList.getData('type')))
				return {
					id: 'grouped-edge-' + combinedId,
					data: {
						type: combinedTypes
					},
					attributes: {
						shape: {
							body: () => 'line',
							style: () => 'plain',
							head: () => null,
							tail: () => 'arrow'
						},
						text: {
							content: combinedTypes.join(', '),
							position: 'center',
							color: 'black',
							size: 12,
							minVisibleSize: 5
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
		{ value: 'None', label: 'None (full graph view)' },
		{ value: 'UndirectedLouvain', label: 'UndirectedLouvain' },
		{ value: 'DirectedLouvain', label: 'DirectedLouvain' },
		{ value: 'Leiden', label: 'Leiden' },
		{ value: 'SLPA', label: 'SLPA (overlap)' }
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
	const setIdGroupForNodes = (nodes: NodeList, forLevel: number = level) => {
		nodes.setData('groupId', (node) => computeCommunityLevel(node, forLevel))
		nodes.setData('level', () => forLevel)
	}
	const computeCommunityLevel = (node: Node, forLevel: number = level) => {
		const communities: number[] = graphType == 'Model' ? node.getData('properties.Community') : node.getData('properties.' + algo)
		//if (communities) return communities.slice(0, Math.min(forLevel, communities.length)).join('.')
		if (communities) return communities[forLevel - 1]
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

	let launchPadOpened = false
	let linkTypes: LinkTypes = []
	const openAlgoLaunchPad = () => {
		if (ogma != undefined) {
			const linkTypeLabels: Set<string> = ogma.getEdges('raw').reduce((acc: Set<string>, edge: Edge) => {
				if (acc === undefined) return new Set([edge.getData('type')])
				if (edge.isVirtual()) edge.getData('type').forEach((type: string) => acc.add(type))
				else acc.add(edge.getData('type'))
				return acc
			}, new Set())
			if (linkTypeLabels.size === 0) return
			linkTypes = Array.from(linkTypeLabels)
				.sort()
				.map((label) => ({ label: label, value: false }))
			launchPadOpened = !launchPadOpened
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
			console.log('Algo:', algo)
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
			<button on:click={applySamiLayout}>Sami custom layout</button>
			<button on:click={applySamiNoRLayout}>Sami custom layout (no radius)</button>
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
				<button on:click={() => openAlgoLaunchPad()}>Algo LaunchPad</button>
			</div>
		</div>
		<div id="zoombar" class="zoombar">
			<button on:click={() => ogma.view.zoomOut({ duration: 200 })}><i class="fa-solid fa-minus"></i></button>
			<button on:click={() => ogma.view.locateGraph(defaultLocateOptions)}><i class="fas fa-crosshairs"></i></button>
			<button on:click={() => ogma.view.zoomIn({ duration: 200 })}><i class="fa-solid fa-plus"></i></button>
			<!-- <div>{currentZoomLevel}%</div> -->
		</div>
	{:catch error}
		<div>error: {error.message}</div>
	{/await}

	<AlgoLaunchPad relationShipTypes={linkTypes} {algo} bind:isOpen={launchPadOpened} />

	{#if metricsModalOpen && selectedGroupNodes}
    <MetricsModal 
        nodes={selectedGroupNodes}
		metaNode={selectedGroupingNode}
        isOpen={metricsModalOpen}
        onClose={() => {
            metricsModalOpen = false
            selectedGroupNodes = null
        }}
    />
{/if}
	{#if nodeDetailsPanelOpen && selectedNode}
	<NodeDetailsPanel 
		node={selectedNode}
		isOpen={nodeDetailsPanelOpen}
		onClose={() => {
			nodeDetailsPanelOpen = false
			selectedNode = null
		}}
	/>
	{/if}
</div>

<!-- Add the LoggerPanel component outside the ogma-graph div -->
<LoggerPanel bind:isOpen={loggerPanelOpen} />

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