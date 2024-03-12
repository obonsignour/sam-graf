<script lang="ts">
	import { appName } from '$lib/generalStore'
	import type { selectElement } from '$lib/selector.svelte'

	export let elements: selectElement[]
	export let selected: string
</script>

<!-- App selection -->

<select class="custom-select" bind:value={selected} name="apps" id="app-selector">
	<option value="default" selected>Select an app</option>
	{#each elements as element}
		<option value={element.value} selected={element.label == $appName}>{element.label}</option>
	{/each}
</select>

<style>
	.custom-select {
		margin: 0 1rem;
		width: calc(10rem * var(--scale, 1));
		font-size: 1rem;
	}
</style>
