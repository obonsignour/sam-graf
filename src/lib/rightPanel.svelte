<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
	export let hoveredIds: [string]

	const over = (e: MouseEvent) => {
		hoveredIds = []
		const target = e.target as HTMLElement
		const lineId = target.getAttribute('data-id')
		hoveredIds[0] = lineId
		if (target.getAttribute('data-is-level') === 'true') {
			const nodes = document.querySelectorAll('.node-name')
			const nodeType = target.getAttribute('data-id')
			nodes.forEach((node) => {
				if (node.getAttribute('data-type') === nodeType) {
					hoveredIds.push(node.getAttribute('data-id') as string)
				}
			})
			return
		}
	}

	const listSorted = async () => {
		const nodes = data.nodes
		nodes.sort((a, b) => {
			if (a.rowData.type < b.rowData.type) {
				return -1
			}
			if (a.rowData.type > b.rowData.type) {
				return 1
			}
			return 0
		})
		// nodes.sort((a, b) => {
		// 	if (a.rowData.fullName < b.rowData.fullName) {
		// 		return -1
		// 	}
		// 	if (a.rowData.fullName > b.rowData.fullName) {
		// 		return 1
		// 	}
		// 	return 0
		// })

		const toReturn = []
		let levelId = 0
		const handleNodeName = (node) => {
			console.log('Node:', node.rowData)
			toReturn.push({
				id: node.id,
				rowData: {
					label: node.rowData.name,
					type: node.rowData.type,
					level: 'nodeName',
					fullName: node.rowData.fullName
				}
			})
			return
		}
		const handleNodeType = (node) => {
			toReturn.push({
				id: node.rowData.type,
				rowData: { label: node.rowData.type, type: node.rowData.type, level: 'nodeType' }
			})
			return
		}

		nodes.forEach((node) => {
			if (toReturn.length === 0) {
				handleNodeType(node)
			}
			if (toReturn[toReturn.length - 1].rowData.type !== node.rowData.type) {
				handleNodeType(node)
			}
			handleNodeName(node)
			return
		})

		return { nodes: toReturn }
	}

	const displayNodeNames = (e: MouseEvent) => {
		const nodeType = (e.target as HTMLElement).getAttribute('data-id')
		const nodes = document.querySelectorAll('.node-name')
		nodes.forEach((node) => {
			if (node.getAttribute('data-type') === nodeType) {
				node.classList.toggle('hidden')
			}
		})
		e.target.classList.toggle('closed')
	}
</script>

<div class="right-panel">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#if data.nodes.length > 0}
		<h2>Nodes</h2>
		<table>
			<tbody>
				#{#await listSorted()}
					<div>Sorting</div>
				{:then sortedList}
					{#each sortedList.nodes as node}
						<tr
							on:focus
							on:mouseover={over}
							data-id={node.id}
							title={node.rowData.fullName || ''}
							class:selected={hoveredIds[0].toString() === node.id}
						>
							{#if node.rowData.level === 'nodeType'}
								<td
									data-id={node.id}
									data-is-level="true"
									class="node-type closed"
									on:click={displayNodeNames}>{node.rowData.label}</td
								>
							{:else}
								<td data-id={node.id} data-type={node.rowData.type} class="node-name hidden"
									>{node.rowData.label}</td
								>
							{/if}
						</tr>
					{/each}
				{/await}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.selected {
		padding: 0.5rem 0;
		border: 1px solid var(--selected);
		background-color: var(--selected);
	}

	.right-panel {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: flex-start;
		height: 100vh;
		min-width: 20rem;
		max-width: 30rem;
		padding: 1rem;
		border: 1px solid #043917;
		background-color: rgb(253, 250, 246);
		overflow: auto;
	}

	table {
		border-collapse: collapse;
		width: 20rem;
	}

	td {
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0.1rem 0;
	}
	.node-type {
		font-weight: bold;
		padding-top: 0.25rem;
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
		padding-left: 1rem;
	}

	.hidden {
		display: none;
	}
</style>
