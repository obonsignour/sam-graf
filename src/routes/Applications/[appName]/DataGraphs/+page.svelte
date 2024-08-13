<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import Graphs from '$lib/graphs.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<Graphs graphListData={{ graphType: 'DataGraph', graphRows: data.datagraphs }} />
