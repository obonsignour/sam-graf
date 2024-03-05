<script lang="ts">
	import type { PageData } from './$types'
	import { appName } from '$lib/generalStore'

	// export let data: PageData
</script>

<div>
	{#if $appName === 'default'}
		<p>Please select an application</p>
	{:else}
		<p>Application selected: {$appName}</p>
	{/if}
</div>
