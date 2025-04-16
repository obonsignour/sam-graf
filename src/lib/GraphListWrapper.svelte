<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import Graphs from '$lib/graphs.svelte';
    import type { GraphListRow } from '$lib/customTypes';
    import { onMount, afterUpdate } from 'svelte';

    export let graphType: 'Transaction' | 'DataGraph';
    export let graphRows: GraphListRow[] = [];
    export let isLoading: boolean = false;
    export let error: string | null = null;

    // Search and filtering
    let searchTerm = '';
    let filterVisible = false;

    // Pagination
    let itemsPerPage = 10;
    let currentPage = 1;
    let currentGraphRows: GraphListRow[] = [];

    // Computed properties
    $: filteredRows = graphRows.filter(row => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        
        // Search across all string fields of the row
        return Object.values(row).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(term)
        );
    });

    // Keep the original order from the API
    $: paginatedRows = filteredRows.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    $: totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
    
    // Update current rows whenever pagination changes
    $: {
        currentGraphRows = [...paginatedRows];
        //console.log(`Page ${currentPage}: Showing rows ${(currentPage-1)*itemsPerPage+1}-${Math.min(currentPage*itemsPerPage, filteredRows.length)} of ${filteredRows.length}`);
        //console.log("First item in current page:", currentGraphRows[0]?.id);
    }
    
    // Make sure current page is valid when total pages changes
    $: if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }

    function toggleFilter() {
        filterVisible = !filterVisible;
    }

    function clearSearch() {
        searchTerm = '';
    }

    function goToPage(newPage: number) {
        console.log(`Changing page from ${currentPage} to ${newPage}`);
        if (newPage > 0 && newPage <= totalPages) {
            currentPage = newPage;
        }
    }
    
    // Force re-render of the Graphs component when page changes
    let key = 0;
    $: {
        currentPage; // watch for changes
        key++; // increment whenever currentPage changes
    }
    
    afterUpdate(() => {
        //console.log("Component updated, displaying page:", currentPage);
        //console.log("Current rows:", currentGraphRows.map(row => row.id).join(', '));
    });
</script>

<div class="graph-list-container" class:loading={isLoading}>
    <div class="header">
        <h1>{graphType}s</h1>
        <div class="controls">
            <button class="icon-button" on:click={toggleFilter} title="Toggle filters">
                <i class="fas fa-filter"></i>
            </button>
        </div>
    </div>

    {#if filterVisible}
        <div class="filter-row" transition:slide={{ duration: 200 }}>
            <div class="search-container">
                <input 
                    type="text" 
                    bind:value={searchTerm} 
                    placeholder="Search..." 
                    class="search-input"
                />
                {#if searchTerm}
                    <button class="clear-search" on:click={clearSearch}>
                        <i class="fas fa-times"></i>
                    </button>
                {/if}
            </div>
            <div class="sort-controls">
                <label for="items-per-page">Show:</label>
                <select id="items-per-page" bind:value={itemsPerPage}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    {/if}

    {#if isLoading}
        <div class="loading-container" transition:fade>
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </div>
            <p>Loading {graphType}s...</p>
        </div>
    {:else if error}
        <div class="error-container" transition:fade>
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p>{error}</p>
            <button class="retry-button">Retry</button>
        </div>
    {:else if graphRows.length === 0}
        <div class="empty-container" transition:fade>
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <p>No {graphType}s found</p>
        </div>
    {:else}
        <div class="list-stats">
            <p>
                Showing rows {(currentPage-1)*itemsPerPage+1}-{Math.min(currentPage*itemsPerPage, filteredRows.length)} of {filteredRows.length} {graphType}s
                {#if filteredRows.length !== graphRows.length}
                    (filtered from {graphRows.length})
                {/if}
            </p>
        </div>

        <!-- Force component re-creation on page change with keyed each block -->
        {#key key}
            <div class="graph-list-wrapper" transition:fade={{ duration: 200 }}>
                <!-- Use the current page rows directly -->
                <Graphs graphListData={{ graphType, graphRows: currentGraphRows }} />
            </div>
        {/key}

        {#if totalPages > 1}
            <div class="pagination">
                <button 
                    class="pagination-button" 
                    on:click={() => goToPage(1)}
                    disabled={currentPage === 1}
                >
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button 
                    class="pagination-button" 
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <i class="fas fa-angle-left"></i>
                </button>

                <div class="page-info">
                    Page {currentPage} of {totalPages}
                </div>

                <button 
                    class="pagination-button" 
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <i class="fas fa-angle-right"></i>
                </button>
                <button 
                    class="pagination-button" 
                    on:click={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .graph-list-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 1rem;
        box-sizing: border-box;
        background-color: rgb(253, 250, 246);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .header h1 {
        margin: 0;
        color: #b30505;
        font-size: 1.5rem;
    }

    .controls {
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
        background-color: rgba(179, 5, 5, 0.1);
    }

    .icon-button:hover {
        background-color: rgba(179, 5, 5, 0.2);
    }

    .filter-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background-color: rgba(179, 5, 5, 0.05);
        border-radius: 4px;
        border: 1px solid rgba(179, 5, 5, 0.1);
    }

    .search-container {
        position: relative;
        width: 250px;
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
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.6;
    }

    .clear-search:hover {
        opacity: 1;
    }

    .sort-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .sort-controls select {
        padding: 0.35rem;
        border-radius: 4px;
        border: 1px solid #ccc;
    }

    .loading-container,
    .error-container,
    .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin: 2rem 0;
    }

    .loading-spinner,
    .error-icon,
    .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #b30505;
    }

    .retry-button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #b30505;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .retry-button:hover {
        background-color: #950404;
    }

    .list-stats {
        margin-bottom: 1rem;
        color: #666;
        font-size: 0.9rem;
    }

    .graph-list-wrapper {
        flex: 1;
        overflow: auto;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
        padding: 0.5rem;
        gap: 0.5rem;
    }

    .pagination-button {
        background: none;
        border: 1px solid #ddd;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
    }

    .pagination-button:not([disabled]):hover {
        background-color: rgba(179, 5, 5, 0.1);
    }

    .pagination-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        padding: 0 1rem;
    }
</style>