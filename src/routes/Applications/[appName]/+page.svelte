<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import SearchDialog from '$lib/searchDialog/+page.svelte'
	import { afterNavigate } from '$app/navigation'
	import type { Concept, SearchConfig } from '$lib/customTypes'

	export let data: PageData
	let searchData: SearchConfig
	let isSearchOpened: boolean = $page.url.searchParams.get('search') === 'true' ? true : false

	afterNavigate(() => {
		console.log('After navigate')
		isSearchOpened = $page.url.searchParams.get('search') === 'true' ? true : false

		if (isSearchOpened && data) {
			searchData = { appName: $page.params.appName, concepts: data.concepts || [] }
		}
	})

	$: console.log('App name: ', $page.params.appName)
	$: isSearchOpened = $page.url.searchParams.get('search') === 'true' ? true : false
</script>

<div>
	{#await data}
		<!-- promise is pending -->
	{:then data}
		{#if data.concepts}
			{#each data.concepts as concept}
				<p>{concept.name} - {concept.count}</p>
			{/each}
			{#if isSearchOpened}
				<SearchDialog config={searchData} />
			{/if}
		{/if}
	{/await}
</div>
