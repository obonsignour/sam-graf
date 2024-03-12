<script lang="ts">
	import type { PageData } from './$types'
	import { appName } from '$lib/generalStore'
	import AnotherSelector from '$lib/anotherSelector/+page.svelte'

	export let data: PageData
</script>

<div class="content">
	{#await data.apps}
		<span>Waiting for the list to be downloaded</span>
	{:then apps}
		{#if apps}
			<span>Please select an application</span>
			<AnotherSelector elements={apps} bind:selected={$appName} />
		{:else}
			<p>No apps found</p>
		{/if}
	{/await}

	{#if $appName !== 'undefined'}
		<p class="action"><a href="/Applications/{$appName}/DataGraphs">Goto {$appName} DataGraphs</a></p>
		<p class="action"><a href="/Applications/{$appName}/Transactions">Goto {$appName} Transactions</a></p>
	{/if}
</div>

<style>
	.content {
		margin: 1rem;
	}

	.action {
		font-weight: 600;
		font-size: 1.5rem;
	}
</style>
