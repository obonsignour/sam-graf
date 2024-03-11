<script lang="ts">
	import Viewer from '$lib/viewer.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

{#if data.graph}
	<Viewer rawGraph={data.graph} />
{:else}
	<div>Select an application</div>
{/if}
