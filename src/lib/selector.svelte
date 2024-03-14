<script context="module" lang="ts">
	export type selectElement = {
		value: string
		label: string
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	export let elements: selectElement[]
	export let selected: string
	export let elementType: string = 'app'

	const dispatch = createEventDispatcher<{ newValueSelectedInCombo: string | number }>()
	const handleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement
		const selected = target.value
		dispatch('newValueSelectedInCombo', selected)
	}
</script>

<!-- App selection -->

<select class="custom-select" bind:value={selected} name="apps" id="app-selector" on:change={handleChange}>
	<option value="default" selected>Select an {elementType}</option>
	{#each elements as element}
		<option value={element.value}>{element.label}</option>
	{/each}
</select>

<style>
	.custom-select {
		/* margin: 0 1rem; */
		width: calc(10rem * var(--scale, 1));
		font-size: 1rem;
	}
</style>
