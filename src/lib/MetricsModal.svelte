<script lang="ts">
    import type { Node, NodeList } from '@linkurious/ogma'
    
    export let nodes: NodeList
    export let isOpen = false
    export let onClose: () => void
    export let metaNode: Node<any, any> | null = null

    const nodeTypeCount = new Map<string, number>()
    const nodeTypes = new Set<string>()

    nodes.forEach((node) => {
        const nodeType = node.getData('properties.Type') || 'Unknown'
        nodeTypes.add(nodeType)
        nodeTypeCount.set(
            nodeType, 
            (nodeTypeCount.get(nodeType) || 0) + 1
        )
    })

    const totalNodes = nodes.size

    const calculateInternalDensity = (nodes: NodeList) => {
        const n = nodes.size
        console.log('Number of nodes in selection:', n)
        
        if (n <= 1) return 0

        // Create bidirectional mappings between IDs and names
        const idToName = new Map()
        const nameToId = new Map()
        const selectedNodeIds = new Set()
        
        // First pass: collect all node information
        nodes.forEach(node => {
            const id = String(node.getId())
            // Get the full node data and extract the name
            const nodeData = node.getData()
            // Try different possible paths to get the name
            const name = nodeData?.name || 
                        nodeData?.properties?.name || 
                        nodeData?.properties?.label ||
                        `special group ${nodeData?.properties?.Type}` || 
                        id
            
            console.log('Node mapping:', { id, name, data: nodeData })
            
            idToName.set(id, name)
            nameToId.set(name, id)
            selectedNodeIds.add(id)
            selectedNodeIds.add(name)
        })
        
        console.log('ID to Name mappings:', Object.fromEntries(idToName))
        console.log('Selected IDs:', Array.from(selectedNodeIds))

        // Get Ogma instance
        const ogma = nodes._ogma
        const allEdges = ogma.getEdges()
        let internalEdges = 0
        
        // Count edges between selected nodes
        allEdges.forEach(edge => {
            const sourceId = String(edge.getSource().getId())
            const targetId = String(edge.getTarget().getId())
            const sourceData = edge.getSource().getData()
            const targetData = edge.getTarget().getData()
            
            // Get all possible identifiers for source and target
            const sourceIdentifiers = new Set([
                sourceId,
                idToName.get(sourceId),
                sourceData?.name,
                sourceData?.properties?.name,
                sourceData?.properties?.label,
                `special group ${sourceData?.properties?.Type}`
            ])
            
            const targetIdentifiers = new Set([
                targetId,
                idToName.get(targetId),
                targetData?.name,
                targetData?.properties?.name,
                targetData?.properties?.label,
                `special group ${targetData?.properties?.Type}`
            ])
            
            const isSourceSelected = Array.from(sourceIdentifiers).some(id => selectedNodeIds.has(id))
            const isTargetSelected = Array.from(targetIdentifiers).some(id => selectedNodeIds.has(id))
            
            if (isSourceSelected && isTargetSelected) {
                internalEdges++
                console.log(`Found internal edge between: ${Array.from(sourceIdentifiers)[0]} -> ${Array.from(targetIdentifiers)[0]}`)
            }
        })

        const maxPossibleEdges = n * (n - 1)
        console.log(`Found ${internalEdges} internal edges out of ${maxPossibleEdges} possible edges`)
        
        return internalEdges / maxPossibleEdges
    }

    const calculateSemanticCohesion = (nodes: NodeList) => {
        const n = nodes.size
        if (n <= 1) return 0

        let totalSimilarity = 0
        let comparisons = 0

        nodes.forEach((node1, i) => {
            const vector1 = node1.getData('properties.vector')
            if (!vector1) return

            nodes.forEach((node2, j) => {
                if (i >= j) return
                
                const vector2 = node2.getData('properties.vector')
                if (!vector2) return

                totalSimilarity += cosineSimilarity(vector1, vector2)
                comparisons++
            })
        })

        return comparisons > 0 ? totalSimilarity / comparisons : 0
    }

    const cosineSimilarity = (vector1: number[], vector2: number[]): number => {
        if (vector1.length !== vector2.length) return 0

        const dotProduct = vector1.reduce((acc, val, i) => acc + val * vector2[i], 0)
        const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val * val, 0))
        const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val * val, 0))

        if (magnitude1 === 0 || magnitude2 === 0) return 0
        return dotProduct / (magnitude1 * magnitude2)
    }

    const nodeTypeDistribution = Array.from(nodeTypeCount.entries())
        .map(([type, count]) => ({
            type, 
            count, 
            percentage: ((count / totalNodes) * 100).toFixed(2)
        }))
        .sort((a, b) => b.count - a.count)

    const internalDensity = calculateInternalDensity(nodes)
    const semanticCohesion = calculateSemanticCohesion(nodes)
    const groupName = metaNode?.getData('groupId') || 'Unnamed Group'
</script>

<div 
    class="metrics-modal" 
    class:open={isOpen}
>
    <div class="metrics-content">
        <button 
            class="close-btn" 
            on:click={onClose}
        >
            ×
        </button>
        <h2>Grouped Nodes Metrics</h2>
        <h3 class="group-name">{groupName}</h3>
        
        <div class="metric-summary">
            <div class="metric-item">
                <span class="label">Total Nodes</span>
                <span class="value">{totalNodes}</span>
            </div>
            <div class="metric-item">
                <span class="label">Internal Density</span>
                <span class="value">{(internalDensity * 100).toFixed(2)}%</span>
            </div>
            <div class="metric-item">
                <span class="label">Semantic Cohesion</span>
                <span class="value">{(semanticCohesion * 100).toFixed(2)}%</span>
            </div>
        </div>

        <div class="node-type-distribution">
            <h3>Node Type Distribution</h3>
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {#each nodeTypeDistribution as distribution}
                        <tr>
                            <td>{distribution.type}</td>
                            <td>{distribution.count}</td>
                            <td>{distribution.percentage}%</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .metrics-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 500px;
        width: 90%;
        padding: 20px;
    }

    .metrics-modal.open {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        pointer-events: all;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .group-name {
        text-align: center;
        color: #666;
        margin-top: -10px;
        margin-bottom: 20px;
    }

    .metric-summary {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 20px;
    }

    .metric-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
    }

    .label {
        color: #666;
        font-size: 0.9em;
        text-align: center;
    }

    .value {
        font-size: 1.5em;
        font-weight: bold;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }
</style>