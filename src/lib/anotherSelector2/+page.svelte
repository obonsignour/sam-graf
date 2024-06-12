<script lang="ts">
	import { relationType } from '$lib/generalStore'
	import type { selectElement } from '$lib/selector.svelte'

	export let elements: selectElement[]
	export let selected: string
</script>

<!-- link selection -->

<select class="custom-select" bind:value={selected} name="linkTypes" id="linkType-selector">
	<option value="default" selected>Select a link type</option>
	{#each elements as element}
		<option value={element.value} selected={element.label == $relationType}>{element.label}</option>
	{/each}
</select>

<style>
	.custom-select {
		margin: 0 1rem;
		width: calc(10rem * var(--scale, 1));
		font-size: 1rem;
	}
</style>
