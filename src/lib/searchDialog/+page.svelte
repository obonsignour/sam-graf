<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import type { SearchConfig } from '$lib/customTypes'

	// import type { PageData } from './$types'

	// export let data: PageData
	export let config: SearchConfig
	const addNewView = () => {
		return
	}
	const closeSearch = () => {
		if (document) {
			const dialog: HTMLDialogElement = document.getElementById('searchDialog') as HTMLDialogElement
			if (dialog) dialog.close()
		}
	}

	const openSearch = () => {
		if (document) {
			const dialog: HTMLDialogElement = document.getElementById('searchDialog') as HTMLDialogElement
			if (dialog) dialog.showModal()
		}
	}

	afterNavigate(() => openSearch())
</script>

<dialog id="searchDialog" class="search-dialog" title="Use the search to select 1 to n objects to be displayed in a view and start exploring">
	<div class="search-panel">
		<h3>Use the search to select 1 to n objects to be displayed in a view and start to explore</h3>
		<div class="search-input">
			<input type="text" placeholder="Search" class="search-input" />
			<i class="fas fa-search"></i>
		</div>
		<div id="search-filters" class="search-filters">
			<div class="search-filters-group">
				<h4>Types</h4>
				{#if config}
					{#each config.concepts as concept}
						<div class="filter">
							<input type="checkbox" id="filter-table" name="filter-table" value="filter-table" />
							<label for="filter-table">{concept.name} ({concept.count})</label>
						</div>
					{/each}
				{/if}
			</div>
			<div class="search-filters-group">
				<h4>Characteristics</h4>
				<div class="filter">
					<input type="checkbox" id="filter-characteristic-1" name="filter-characteristic-1" value="filter-characteristic-1" />
					<label for="filter-characteristic-1">Filter 1</label>
				</div>
				<div class="filter">
					<input type="checkbox" id="filter-characteristic-2" name="filter-characteristic-2" value="filter-characteristic-2" />
					<label for="filter-characteristic-2">Filter 2</label>
				</div>
				<div class="filter">
					<input type="checkbox" id="filter-characteristic-3" name="filter-characteristic-3" value="filter-characteristic-3" />
					<label for="filter-characteristic-3">Filter 3</label>
				</div>
			</div>
			<div class="search-filters-group">
				<h4>Insights</h4>
				<div class="filter">
					<input type="checkbox" id="filter-insight-1" name="filter-insight-1" value="filter-insight-1" />
					<label for="filter-insight-1">Filter 1</label>
				</div>
				<div class="filter">
					<input type="checkbox" id="filter-insight-2" name="filter-insight-2" value="filter-insight-2" />
					<label for="filter-insight-2">Filter 2</label>
				</div>
				<div class="filter">
					<input type="checkbox" id="filter-insight-3" name="filter-insight-3" value="filter-insight-3" />
					<label for="filter-insight-3">Filter 3</label>
				</div>
			</div>
		</div>
	</div>
	<br />
	<div id="search-actions" class="search-actions">
		<button class="btn" on:click={addNewView}>Display</button>
		<button class="btn" on:click={closeSearch}>Cancel</button>
	</div>
</dialog>

<style>
	.search-dialog {
		width: 80%;
		height: 80%;
	}

	.search-input {
		width: 80%;
	}
	.search-filters {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(4 1fr);
	}
</style>
