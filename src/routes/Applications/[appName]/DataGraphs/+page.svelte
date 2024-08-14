<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import Graphs from '$lib/graphs.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

{#await data}
	<dialog>Loading data</dialog>
{:then data}
	<Graphs graphListData={{ graphType: 'DataGraph', graphRows: data.datagraphs }} />
{/await}
