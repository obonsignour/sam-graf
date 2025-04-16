<script lang="ts">
	import type { RawGraph, RawNode } from '@linkurious/ogma'
	import { slide } from 'svelte/transition';
	// import { cubicOut } from 'svelte/easing';

	export let rawGraph: RawGraph
	export let hoveredIds: string[]

	let searchTerm = '';
	let expandedTypes = new Set();
	let isFilterVisible = false;
	let isPanelCollapsed = false;

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
		// Highlight but don't auto-expand on hover
		if (hoveredIds.length > 0) hoveredIds = []

		const target = e.target as HTMLElement
		const lineId = target.getAttribute('data-id') || ''
		hoveredIds[0] = lineId
		
		// Don't auto-expand categories on hover anymore
		return
	}

	// Explicitly handle click on type headers to expand/collapse
	const handleTypeClick = (typeId: string) => {
		// Skip if typeId is null or empty
		if (!typeId) return;
		
		console.log("Clicked type:", typeId);
		
		// Toggle in our expanded types set
		if (expandedTypes.has(typeId)) {
			expandedTypes.delete(typeId);
		} else {
			expandedTypes.add(typeId);
		}
		
		// Force reactivity by reassigning
		expandedTypes = new Set(expandedTypes);
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
		// Skip empty IDs
		if (!id || id === '') return undefined;
		
		const nodeListElement = document.getElementById('node-list')
		const node = document.getElementById(id)
		if (nodeListElement !== null && node !== null) {
			const type = node.dataset.type
			if (!type) return undefined;
			
			const typeElements = nodeListElement.querySelectorAll('.node-type')
			for (let i = 0; i < typeElements.length; i++) {
				let item = typeElements[i]
				if (item.getAttribute('data-id') === type) return item
			}
		}
		return undefined;
	}
	
	// Whether a node matches the current search term
	const nodeMatchesSearch = (node: RowData) => {
		if (!searchTerm) return true;
		const term = searchTerm.toLowerCase();
		
		// Always include type nodes in search results
		if (node.rowData.level === 'nodeType') return true;
		
		return node.rowData.label.toLowerCase().includes(term) || 
			(node.rowData.fullName && node.rowData.fullName.toLowerCase().includes(term));
	}
	
	// Toggle search filter
	const toggleFilter = () => {
		isFilterVisible = !isFilterVisible;
		if (!isFilterVisible) {
			searchTerm = '';
		}
	}
	
	// Toggle panel collapse
	const togglePanel = () => {
		isPanelCollapsed = !isPanelCollapsed;
	}
	
	// Expand a node type
	const expandType = (type: string) => {
		if (!type) return;
		expandedTypes.add(type);
		// Force reactivity by reassigning
		expandedTypes = new Set(expandedTypes);
	}
	
	// Count nodes of a certain type
	const countNodesOfType = (nodes: RowData[], type: string) => {
		return nodes.filter(node => 
			node.rowData.level === 'nodeName' && 
			node.rowData.type === type
		).length;
	}

	$: {
		if (hoveredIds && hoveredIds.length > 0) {
			hoveredIds.forEach((id) => {
				// Skip empty IDs
				if (!id || id === '') return;
				
				const nodeElement = document.getElementById(id);
				if (nodeElement && nodeElement.dataset.type) {
					// Expand the type when a node is highlighted in the graph
					expandType(nodeElement.dataset.type);
				}
			});
		}
	}
	
	// Clear search
	const clearSearch = () => {
		searchTerm = '';
	}
</script>

<div class="right-panel" class:collapsed={isPanelCollapsed}>
	<button class="toggle-btn" on:click={togglePanel} title={isPanelCollapsed ? "Expand panel" : "Collapse panel"}>
		<i class="fas fa-{isPanelCollapsed ? 'chevron-left' : 'chevron-right'}"></i>
	</button>
	
	{#if !isPanelCollapsed}
		<div class="panel-content" transition:slide={{ duration: 200 }}>
			<div class="panel-header">
				<h2>Nodes</h2>
				<div class="panel-controls">
					<button class="icon-button" on:click={toggleFilter} title="Toggle search filter">
						<i class="fas fa-search"></i>
					</button>
				</div>
			</div>
			
			{#if isFilterVisible}
				<div class="search-container" transition:slide={{ duration: 200 }}>
					<div class="search-input-container">
						<input 
							type="text" 
							bind:value={searchTerm} 
							placeholder="Filter nodes..." 
							class="search-input"
						/>
						{#if searchTerm}
							<button class="clear-search" on:click={clearSearch}>
								<i class="fas fa-times"></i>
							</button>
						{/if}
					</div>
				</div>
			{/if}
			
			{#if rawGraph && rawGraph.nodes && rawGraph.nodes.length > 0}
				<div class="list-wrapper">
					<div id="node-list" class="node-list">
						{#await sortedRows(rawGraph)}
							<div class="loading-indicator">
								<i class="fas fa-circle-notch fa-spin"></i>
								<span>Loading nodes...</span>
							</div>
						{:then sortedList}
							{#each sortedList.nodes.filter(nodeMatchesSearch) as node}
								<div
									class="line-item"
									on:mouseover={over}
									class:hovered={isHovered(hoveredIds, node.id)}
									data-id={node.id}
									title={node.rowData.fullName || ''}
								>
									{#if node.rowData.level === 'nodeType'}
										<!-- Type header -->
										<div 
											id={node.id || `type-${node.rowData.label}`} 
											data-id={node.id} 
											data-is-level="true" 
											class="node-type" 
											class:expanded={expandedTypes.has(node.id)}
											on:click={() => handleTypeClick(node.id)}
										>
											<div class="node-type-header">
												<i class="fas fa-chevron-right node-expand-icon"></i>
												<span class="node-type-label">{node.rowData.label}</span>
												<span class="node-count">{countNodesOfType(sortedList.nodes, node.id)}</span>
											</div>
										</div>
									{:else if expandedTypes.has(node.rowData.type) || searchTerm}
										<!-- Child node -->
										<div 
											id={node.id || `node-${node.rowData.label}`} 
											data-id={node.id} 
											data-type={node.rowData.type} 
											class="node-name"
											transition:slide={{ duration: 150 }}
										>
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
	{/if}
</div>

<style>
	:global(body) {
		--right-panel-width: 20rem;
		--max-right-panel-width: calc(100vw - 2rem);
	}

	.right-panel {
		display: flex;
		flex-direction: column;
		height: var(--content-height);
		min-height: 0;
		min-width: var(--right-panel-width);
		max-width: var(--max-right-panel-width);
		width: var(--right-panel-width);
		border: 1px solid #b30505;
		background-color: rgb(253, 250, 246);
		overflow: hidden;
		box-sizing: border-box;
		position: relative;
		transition: width 0.3s ease;
	}
	
	.right-panel.collapsed {
		width: 2rem;
		min-width: 2rem;
	}
	
	.toggle-btn {
		position: absolute;
		top: 1rem;
		left: -12px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #b30505;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
	}
	
	.panel-content {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(179, 5, 5, 0.2);
		background-color: rgba(179, 5, 5, 0.05);
	}
	
	.panel-header h2 {
		margin: 0;
		font-size: 1.2rem;
		color: #333;
	}
	
	.panel-controls {
		display: flex;
		gap: 0.5rem;
	}
	
	.icon-button {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}
	
	.icon-button:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}
	
	.search-container {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(179, 5, 5, 0.2);
	}
	
	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.search-input {
		width: 100%;
		padding: 0.5rem;
		padding-right: 2rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
	}
	
	.clear-search {
		position: absolute;
		right: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.6;
	}
	
	.clear-search:hover {
		opacity: 1;
	}

	.list-wrapper {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	.node-list {
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem;
	}
	
	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		color: #777;
		gap: 0.5rem;
	}

	.line-item {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
		box-sizing: border-box;
	}
	
	.line-item.hovered {
		background-color: rgba(179, 5, 5, 0.1);
	}

	.node-type {
		padding: 0.5rem 0;
		width: 100%;
		cursor: pointer;
		user-select: none;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	
	.node-type:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
	
	.node-type-header {
		display: flex;
		align-items: center;
	}
	
	.node-expand-icon {
		width: 1rem;
		margin-right: 0.5rem;
		transition: transform 0.2s;
	}
	
	.node-type.expanded .node-expand-icon {
		transform: rotate(90deg);
	}
	
	.node-type-label {
		font-weight: 600;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.node-count {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 12px;
		font-size: 0.8rem;
		margin-left: 0.5rem;
		min-width: 1.2rem;
		text-align: center;
	}

	.node-name {
		padding: 0.4rem 0 0.4rem 1.5rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 100%;
		box-sizing: border-box;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	
	.node-name:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
</style>