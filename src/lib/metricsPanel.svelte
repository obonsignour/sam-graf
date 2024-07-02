<script lang="ts">
	import { onMount } from 'svelte';

	export let metrics: string[] = [];
	export let isOpen: boolean = false;

	let panel: HTMLDialogElement | null = null;

	onMount(() => {
		panel = document.getElementById('metric-panel') as HTMLDialogElement;
		if (isOpen && panel) panel.showModal();
	});

	const closePanel = () => {
		isOpen = false;
		if (panel) panel.close();
	};

	$: if (panel) {
		isOpen ? panel.showModal() : panel.close();
	}
</script>

<dialog id="metric-panel">
	<h1>Group Metrics</h1>
	<ul>
		{#each metrics as metric}
			<li>{metric}</li>
		{/each}
	</ul>
	<button on:click={closePanel}>Close</button>
</dialog>

<style>
	ul {
		list-style: none;
	}

	li {
		margin: 0.5rem 0;
	}
</style>
