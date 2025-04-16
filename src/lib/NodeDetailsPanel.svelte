<script lang="ts">
    import type { Node } from '@linkurious/ogma'
    import { onMount } from 'svelte';
    import { getContext } from 'svelte';
    
    export let node: Node | null = null
    export let isOpen = false
    export let onClose: () => void

    // Get application context
    const appName = getContext('application') || 'ecommerce115';
    
    // Properly retrieve node attributes with getData method
    $: nodeType = node ? node.getData('properties.Type') : null
    $: architecturalRole = node ? node.getData('properties.roleArchitectural') : null
    $: architecturalCategory = node ? node.getData('properties.coucheArchitecturale') : null
    $: roleConfidence = node ? node.getData('properties.confianceRole') : null
    $: detectionMethod = node ? node.getData('properties.methodeDetectionRole') : null
    $: nodeName = node ? node.getData('properties.Name') : 'Unnamed Node'
    $: nodeId = node ? node.getData('properties.AipId') || node.getId() : null
    
    // Debug logging whenever node changes
    $: if (node) {
        console.log("[NodeDetailsPanel] Node selected:", {
            id: nodeId,
            name: nodeName,
            type: nodeType,
            properties: node.getData('properties')
        });
    }
    
    // Get all properties for displaying additional information
    $: nodeData = node?.getData()
    $: properties = nodeData?.properties || {}
    
    // Define role confidence styling
    $: confidenceColor = getConfidenceColor(roleConfidence)
    
    // Get category-specific colors
    $: categoryColor = getCategoryColor(architecturalCategory)
    $: roleColor = getRoleColor(architecturalRole, architecturalCategory)

    // Source code related state
    let sourceCode = '';
    let isLoadingSource = false;
    let sourceError = null;
    let showSourceCode = false;
    
    function getConfidenceColor(confidence) {
        if (!confidence) return '#777'
        
        if (confidence >= 0.8) return '#4CAF50' // High confidence - green
        if (confidence >= 0.5) return '#FFC107' // Medium confidence - amber
        return '#F44336' // Low confidence - red
    }
    
    function getCategoryColor(category) {
        if (!category) return '#777'
        
        const categoryColors = {
            'DATA': '#2196F3',         // Blue
            'INTERFACE': '#9C27B0',    // Purple
            'INFRASTRUCTURE': '#FF9800', // Orange
            'UTILITY': '#4CAF50',      // Green
            'BUSINESS': '#F44336'      // Red
        }
        
        return categoryColors[category] || '#777'
    }
    
    function getRoleColor(role, category) {
        if (!role || !category) return '#777'
        
        // Lighter shades of the category colors
        const roleColors = {
            'DATA': {
                'Entity': '#90CAF9',
                'Repository': '#64B5F6',
                'ValueObject': '#42A5F5',
                'Enum': '#2196F3'
            },
            'INTERFACE': {
                'Controller': '#CE93D8',
                'View': '#BA68C8',
                'Formatter': '#AB47BC',
                'InputValidator': '#9C27B0'
            },
            'INFRASTRUCTURE': {
                'Configuration': '#FFCC80',
                'Security': '#FFB74D',
                'Logger': '#FFA726',
                'Integration': '#FF9800'
            },
            'UTILITY': {
                'Helper/Util': '#A5D6A7',
                'Mapper': '#81C784',
                'Builder': '#66BB6A'
            },
            'BUSINESS': {
                'Service': '#EF9A9A',
                'DomainService': '#E57373',
                'Calculator': '#EF5350',
                'Validator': '#F44336',
                'Factory': '#E53935'
            }
        }
        
        return roleColors[category]?.[role] || categoryColor || '#777'
    }
    
    function getRoleDescription(role, category) {
        const descriptions = {
            'DATA': {
                'Entity': 'A persistent business object mapped to a database. Primarily read-only, accessed via a Repository.',
                'Repository': 'An interface between business logic and the database. Executes queries and encapsulates entity access.',
                'ValueObject': 'An immutable class encapsulating a value without identity. Used for data storage.',
                'Enum': 'A set of predefined constant values representing fixed types.'
            },
            'INTERFACE': {
                'Controller': 'Handles user interactions by receiving requests and redirecting them to the business layer.',
                'View': 'User interface that displays data and interacts with users without containing business logic.',
                'Formatter': 'Transforms data before display to ensure consistent formatting (dates, currency, text).',
                'InputValidator': 'Validates user inputs before processing, applying business rules to prevent incorrect data.'
            },
            'INFRASTRUCTURE': {
                'Configuration': 'Defines global parameters for application functioning, centralizing values used by multiple services.',
                'Security': 'Manages authentication, authorization, and access protection mechanisms.',
                'Logger': 'Records events, errors, and diagnostic information for proper application functioning.',
                'Integration': 'Manages interactions with external services without containing business logic.'
            },
            'UTILITY': {
                'Helper/Util': 'Provides generic reusable functionality throughout the application.',
                'Mapper': 'Transforms objects from one model to another without containing business logic.',
                'Builder': 'Allows progressive construction of complex objects through chained method calls.'
            },
            'BUSINESS': {
                'Service': 'Implements business rules and orchestrates calls to specialized components.',
                'DomainService': 'Implements business logic directly related to the domain model.',
                'Calculator': 'Performs complex business calculations on numerical data or domain objects.',
                'Validator': 'Applies validation rules to verify data conformity before processing.',
                'Factory': 'Encapsulates instance creation and applies initialization rules.'
            }
        }
        
        return descriptions[category]?.[role] || 'No description available for this role.'
    }

    // Function to fetch source code for the current node
    async function fetchSourceCode() {
        if (!nodeId) {
            console.warn("[NodeDetailsPanel] Cannot fetch source code: nodeId is null or undefined");
            return;
        }
        
        isLoadingSource = true;
        sourceError = null;
        
        const apiUrl = `/API/source-code/${appName}/${nodeId}`;
        console.log(`[NodeDetailsPanel] Fetching source code from: ${apiUrl}`);
        
        try {
            const response = await fetch(apiUrl);
            console.log(`[NodeDetailsPanel] API response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching source code: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`[NodeDetailsPanel] API response data:`, data);
            
            if (data.success === false) {
                throw new Error(`Error fetching source code: ${data.error}`);
            }
            
            sourceCode = data.sourceCode || 'No source code available';
            console.log(`[NodeDetailsPanel] Fetched source code for node ${nodeId}. Path: ${data.sourcePath}, Lines: ${data.lineStart}-${data.lineEnd}`);
        } catch (error) {
            console.error('[NodeDetailsPanel] Error fetching source code:', error);
            sourceError = error.message;
            sourceCode = '';
        } finally {
            isLoadingSource = false;
        }
    }

    // Watch for changes to the node ID and fetch source code when it changes
    $: if (isOpen && nodeId && showSourceCode) {
        console.log(`[NodeDetailsPanel] Node is open and showSourceCode is true, fetching source code for nodeId: ${nodeId}`);
        fetchSourceCode();
    }

    function toggleSourceCode() {
        showSourceCode = !showSourceCode;
        console.log(`[NodeDetailsPanel] Source code toggled to: ${showSourceCode}`);
        if (showSourceCode && nodeId) {
            fetchSourceCode();
        }
    }
</script>

<div 
    class="node-details-panel" 
    class:open={isOpen}
    style="--category-color: {categoryColor || '#ddd'};"
>
    <div class="panel-content">
        <button 
            class="close-btn" 
            on:click={onClose}
        >
            ×
        </button>
        <h2>Node Architectural Details</h2>
        
        {#if node}
            <h3 class="node-name">{nodeName}</h3>
            <div class="node-id">ID: {nodeId}</div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Type</span>
                    <span class="value">{nodeType || 'Unknown'}</span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Architectural Category</span>
                    <span 
                        class="value category-tag" 
                        style="background-color: {categoryColor}20; color: {categoryColor}; border: 1px solid {categoryColor};"
                    >
                        {architecturalCategory || 'Not Classified'}
                    </span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Architectural Role</span>
                    <span 
                        class="value role-tag" 
                        style="background-color: {roleColor}20; color: {roleColor}; border: 1px solid {roleColor};"
                    >
                        {architecturalRole || 'Not Assigned'}
                    </span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Role Confidence</span>
                    <div class="confidence-indicator">
                        <div 
                            class="confidence-bar" 
                            style="width: {(roleConfidence || 0) * 100}%; background-color: {confidenceColor};"
                        ></div>
                        <span class="confidence-value">{roleConfidence ? (roleConfidence * 100).toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-item">
                    <span class="label">Detection Method</span>
                    <span class="value">{detectionMethod || 'Not Specified'}</span>
                </div>
            </div>
            
            <!-- Description based on role and category -->
            <div class="role-description">
                <h4>Role Description</h4>
                {#if architecturalRole && architecturalCategory}
                    <p>
                        {getRoleDescription(architecturalRole, architecturalCategory)}
                    </p>
                {:else}
                    <p class="no-description">No role classification available for this node.</p>
                {/if}
            </div>
            
            <!-- Source Code Section -->
            <div class="source-code-section">
                <div class="source-code-header" on:click={toggleSourceCode}>
                    <h4>Source Code</h4>
                    <button class="toggle-btn">{showSourceCode ? '▼' : '►'}</button>
                </div>
                
                {#if showSourceCode}
                    {#if isLoadingSource}
                        <div class="loading">Loading source code...</div>
                    {:else if sourceError}
                        <div class="error">Error: {sourceError}</div>
                    {:else if sourceCode}
                        <div class="source-code-container">
                            <pre class="source-code">{sourceCode}</pre>
                        </div>
                    {:else}
                        <div class="no-source">No source code available for this node.</div>
                    {/if}
                {/if}
            </div>
            
            <div class="additional-properties">
                <h4>Additional Information</h4>
                <div class="property-list">
                    {#each Object.entries(properties).filter(([key]) => !['Type', 'architecturalRole', 'architecturalCategory', 'roleConfidence', 'detectionMethod', 'Name'].includes(key)) as [key, value], i}
                        {#if i < 5 && value !== null && value !== undefined}
                            <div class="property-item">
                                <span class="property-key">{key}:</span>
                                <span class="property-value">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {:else}
            <div class="no-node-selected">
                No node selected. Click on a node to view its details.
            </div>
        {/if}
    </div>
</div>

<style>
    .node-details-panel {
        position: fixed;
        top: 50%;
        right: 0;
        transform: translateY(-50%) translateX(100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 10px 0 0 10px;
        box-shadow: -2px 0 6px rgba(0,0,0,0.1);
        max-width: 450px; /* Increased from 350px to accommodate source code */
        width: 90%;
        height: auto;
        max-height: 80vh;
        padding: 20px;
        overflow-y: auto;
        border-left: 3px solid;
        border-color: var(--category-color, #ddd);
    }
    
    :global(.node-details-panel.open) {
        --category-color: attr(data-category-color);
    }

    .node-details-panel.open {
        transform: translateY(-50%) translateX(0);
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

    .node-name {
        text-align: center;
        color: #333;
        margin-top: 0;
        margin-bottom: 5px;
        padding-bottom: 5px;
        font-weight: 600;
    }
    
    .node-id {
        text-align: center;
        color: #777;
        font-size: 0.8em;
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }

    .details-grid {
        display: grid;
        gap: 16px;
        margin-bottom: 20px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
    }

    .label {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 4px;
    }

    .value {
        font-size: 1.1em;
        font-weight: 500;
    }

    .category-tag, .role-tag {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .confidence-indicator {
        position: relative;
        height: 20px;
        background-color: #f5f5f5;
        border-radius: 10px;
        overflow: hidden;
    }

    .confidence-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    .confidence-value {
        position: absolute;
        right: 8px;
        top: 2px;
        font-size: 0.8em;
        color: #333;
    }
    
    /* Source Code Section Styles */
    .source-code-section {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }
    
    .source-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 5px 0;
    }
    
    .source-code-header h4 {
        margin: 0;
        color: #555;
    }
    
    .toggle-btn {
        background: none;
        border: none;
        color: #555;
        font-size: 16px;
        cursor: pointer;
    }
    
    .source-code-container {
        margin-top: 10px;
        max-height: 300px;
        overflow-y: auto;
        background-color: #f5f5f5;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
    
    .source-code {
        padding: 10px;
        margin: 0;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    
    .loading, .error, .no-source {
        padding: 10px;
        font-style: italic;
        color: #666;
        text-align: center;
    }
    
    .error {
        color: #d32f2f;
    }

    .additional-properties {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }

    .additional-properties h4 {
        margin-top: 0;
        color: #555;
    }

    .property-list {
        display: grid;
        gap: 8px;
    }

    .property-item {
        display: flex;
        flex-wrap: wrap;
        font-size: 0.9em;
    }

    .property-key {
        color: #666;
        margin-right: 6px;
        font-weight: 500;
    }

    .property-value {
        color: #333;
        max-width: 100%;
        word-break: break-word;
    }

    .role-description {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }
    
    .role-description h4 {
        margin-top: 0;
        color: #555;
    }
    
    .role-description p {
        line-height: 1.5;
        color: #333;
    }
    
    .no-description, .no-node-selected {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 10px 0;
    }
</style>