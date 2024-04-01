<script lang="ts">
	import type { RawGraph, RawNode } from '@linkurious/ogma'

	export let rawGraph: RawGraph
	export let hoveredIds: string[]

	type NodeRow = {
		id: string
		rowData: {
			name: string
			type: string
			fullName: string
		}
	}

	type RowData = {
		id: string
		rowData: {
			label: string
			type: string
			level: 'nodeType' | 'nodeName'
			fullName?: string
		}
	}

	const convertNodetoRow = (node: RawNode): NodeRow => {
		return {
			id: node.id.toString(),
			rowData: { name: node.data.properties.Name, type: node.data.properties.Type, fullName: node.data.properties.FullName }
		}
	}

	const getNodesAsList = (graph: RawGraph): NodeRow[] => {
		const nodes = graph.nodes.map((node) => convertNodetoRow(node))
		return nodes.filter((node) => node !== undefined)
	}

	const getListFromGraph = (graph: RawGraph) => {
		//for now we are only using the nodes
		const nodes = getNodesAsList(graph)
		return { nodes }
	}

	const sortedRows = async (rawGraph: RawGraph) => {
		const nodeRows = getListFromGraph(rawGraph).nodes.filter((node) => node !== undefined)
		nodeRows.sort((a, b) => {
			if (a.rowData.type < b.rowData.type) {
				return -1
			}
			if (a.rowData.type > b.rowData.type) {
				return 1
			}
			return 0
		})

		let toReturn: RowData[] = []

		const handleNodeName = (node: NodeRow): RowData => {
			return {
				id: node.id,
				rowData: {
					label: node.rowData.name,
					type: node.rowData.type,
					level: 'nodeName',
					fullName: node.rowData.fullName
				}
			}
		}

		const handleNodeType = (node: NodeRow): RowData => {
			return {
				id: node.rowData.type,
				rowData: { label: node.rowData.type, type: node.rowData.type, level: 'nodeType' }
			}
		}

		nodeRows.forEach((nodeRow) => {
			if (toReturn.length === 0) {
				toReturn = [...toReturn, handleNodeType(nodeRow)]
			}
			if (toReturn[toReturn.length - 1].rowData.type !== nodeRow.rowData.type) {
				toReturn = [...toReturn, handleNodeType(nodeRow)]
			}
			toReturn = [...toReturn, handleNodeName(nodeRow)]
			return
		})

		return { nodes: toReturn }
	}

	const over = (e: MouseEvent) => {
		// console.log('In over, hoveredIds: ', hoveredIds === undefined ? 'undefined' : hoveredIds)
		if (hoveredIds.length > 0) hoveredIds = []

		const target = e.target as HTMLElement
		const lineId = target.getAttribute('data-id') || ''
		hoveredIds[0] = lineId
		if (target.getAttribute('data-is-level') === 'true') {
			const nodes = document.querySelectorAll('.node-name')
			const nodeType = target.getAttribute('data-id')
			nodes.forEach((node) => {
				if (node.getAttribute('data-type') === nodeType) {
					hoveredIds = [...hoveredIds, node.getAttribute('data-id') as string]
				}
			})
			return
		}
		return
	}

	const openType = (type: Element) => {
		const nodeType = type.getAttribute('data-id')
		const nodeListElement = document.getElementById('node-list')
		if (nodeListElement === null) return
		const nodes = nodeListElement.querySelectorAll('.node-name')
		nodes.forEach((node) => {
			if (node.getAttribute('data-type') === nodeType) {
				node.classList.remove('hidden')
			}
		})
		type.classList.remove('closed')
	}

	const toggleType = (e: MouseEvent) => {
		const target = e.target as Element
		const nodeType = target.getAttribute('data-id')
		const nodeListElement = document.getElementById('node-list')
		if (nodeListElement === null) return
		const nodes = nodeListElement.querySelectorAll('.node-name')
		nodes.forEach((node) => {
			if (node.getAttribute('data-type') === nodeType) {
				node.classList.toggle('hidden')
			}
		})
		target.classList.toggle('closed')
	}

	const isNodeHoveredInGraph = (nodeId: string): boolean => {
		if (!hoveredIds || hoveredIds.length === 0) return false
		if (!hoveredIds.find((id) => id === nodeId)) return false
		return true
	}

	// hoeveredIds included in the parameters to force reactivity
	const isHovered = (hovereds: string[], type: string) => {
		return hovereds.includes(type)
	}

	const findTypeElement = (id: string): Element | undefined => {
		const nodeListElement = document.getElementById('node-list')
		const node = document.getElementById(id)
		if (nodeListElement !== null && node !== null) {
			const type = node.dataset.type
			const typeElements = nodeListElement.querySelectorAll('.node-type')
			for (let i = 0; i < typeElements.length; i++) {
				let item = typeElements[i]
				if (item.getAttribute('data-id') === type) return item
			}
		}
	}

	// $: console.log('RightPanel got: ', hoveredIds)
	$: {
		if (hoveredIds && hoveredIds.length > 0) {
			hoveredIds.forEach((id) => {
				const typeElement = findTypeElement(id)
				if (typeElement) openType(typeElement)
				// node.scrollIntoView({ behavior: 'smooth', block: 'center' })
			})
			// console.log('HoveredIds:', hoveredIds)
		}
	}
</script>

<div class="right-panel">
	<h2>Nodes</h2>
	{#if rawGraph && rawGraph.nodes && rawGraph.nodes.length > 0}
		<div class="list-wrapper">
			<div id="node-list" class="node-list">
				{#await sortedRows(rawGraph)}
					<div>Sorting</div>
				{:then sortedList}
					{#each sortedList.nodes as node}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="line-item"
							on:focus
							on:mouseover={over}
							class:hovered={isHovered(hoveredIds, node.id)}
							data-id={node.id}
							title={node.rowData.fullName || ''}
						>
							{#if node.rowData.level === 'nodeType'}
								<div id={node.id} data-id={node.id} data-is-level="true" class="node-type closed" on:click={toggleType}>
									{node.rowData.label}
								</div>
							{:else}
								<div id={node.id} data-id={node.id} data-type={node.rowData.type} class="node-name hidden">
									{node.rowData.label}
								</div>
							{/if}
						</div>
					{/each}
				{/await}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		--right-panel-width: 20rem;
	}
	.hovered {
		/* border: 2px solid var(--hovered); */
		/* background-color: var(--hovered); */
		color: var(--hovered);
	}

	.line-item.hovered:has(> .hidden) {
		border: 0px;
	}
	.right-panel {
		display: flex;
		flex-direction: column;
		/* align-items: left;
		justify-content: flex-start; */
		height: var(--content-height);
		min-height: 0;
		min-width: var(--right-panel-width);
		width: var(--right-panel-width);
		padding: 1rem;
		border: 1px solid #b30505;
		background-color: rgb(253, 250, 246);
		overflow: hidden;

		box-sizing: border-box;
	}
	.list-wrapper {
		display: flex;
		flex-direction: column;
		border-collapse: collapse;
		/* justify-content: flex-start;
		align-items: flex-start; */
		overflow-y: auto;
		overflow-x: hidden;
		box-sizing: border-box;
	}
	.node-list {
		display: flex;
		flex-direction: column;
		min-height: 0;
		max-height: 100%;
		/* align-items: flex-start;
		justify-content: flex-start; */
		overflow-y: auto;
		overflow-x: hidden;
		box-sizing: border-box;
		padding: 0;
	}

	.line-item {
		display: flex;
		/* min-height: 1.25rem; */
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		padding: 0;
		width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* .node-list:nth-child() {
		color: aqua;
	} */

	.node-type {
		min-height: 1.25rem;
		/* margin: 0.25rem 0 0 0;
		padding: 0.5rem 0 0.25rem 0; */
		font-weight: 900;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: calc(var(--right-panel-width) - 2rem);
	}

	.node-type::before {
		content: '\f0d7'; /* Unicode for fa-arrow-right */
		font-family: 'Font Awesome 5 Free'; /* Font family for free solid icons */
		font-weight: 900; /* Font weight for free solid icons */
		margin-right: 0.5rem; /* Add some space between the image and the text */
	}
	.node-type.closed::before {
		content: '\f0da'; /* Unicode for fa-arrow-right */
		font-family: 'Font Awesome 5 Free'; /* Font family for free solid icons */
		font-weight: 900; /* Font weight for free solid icons */
		margin-right: 0.5rem; /* Add some space between the image and the text */
	}
	.node-name {
		/* margin: 0.125rem 0; */
		min-height: 1.25rem;
		padding-left: 1rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: calc(var(--right-panel-width) - 2rem);
	}

	.hidden {
		display: none;
		margin: 0;
	}
</style>
