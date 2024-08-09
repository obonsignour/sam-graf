<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import Viewer from '$lib/viewer.svelte'
	import { setContext } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	setContext('graphId', data.id)
	setContext('graphType', 'Model')

	$: $pageTitle = `Model ${data.id} for ${$appName}`
</script>

{#if data.rawGraph}
	<Viewer rawGraph={data.rawGraph} />
{:else}
	<div>Select an application</div>
{/if}

<style>
</style>
