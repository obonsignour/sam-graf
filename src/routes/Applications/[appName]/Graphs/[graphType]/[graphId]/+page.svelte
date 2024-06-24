<script lang="ts">
	import { page } from '$app/stores'
	import { appName, pageTitle } from '$lib/generalStore'
	import Viewer from '$lib/viewer.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	$: $pageTitle = `${$page.params.graphType} ${data.name} for ${$appName}`
</script>

{#if data.graph}
	<Viewer rawGraph={data.graph} />
{:else}
	<div>Select an application</div>
{/if}

<style>
</style>
