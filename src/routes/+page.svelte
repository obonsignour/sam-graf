<script lang="ts">
	import Ogma from '@linkurious/ogma';
	import { count } from '$lib/state';
	import CountButton from '$lib/countButton.svelte';

	// action
	function setup(node: HTMLDivElement, count: number) {
		const ogma = new Ogma({
			container: node.getAttribute('id'),
			graph: {
				nodes: [{ id: 0 }],
				edges: []
			}
		});
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: 'node',
				position: 'center',
				color: 'white'
			}
		});
		return {
			update(count: number) {
				return ogma
					.addGraph({
						nodes: [{ id: count }],
						edges: [{ source: 0, target: count }]
					})
					.then(() => ogma.layouts.force({ locate: true }));
			},
			destroy() {
				// kill ogma instance when the container is removed from DOM
				return ogma.destroy();
			}
		};
	}
</script>

<svelte:head>
	<title>Sam-Graf</title>
</svelte:head>

<h1>Welcome to Sam-Graf with Ogma</h1>
<a href="/TestComponent/Another page">Home</a>
<CountButton />
<div id="container" use:setup={$count}></div>

<style>
	#container {
		width: 400px;
		height: 400px;
		margin: auto;
		border: 1px solid #ccc;
	}
</style>
