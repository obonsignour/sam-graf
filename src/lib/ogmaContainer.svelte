<script lang="ts">
	import Ogma, { type RawGraph } from '@linkurious/ogma'
	import { count } from '$lib/state'
	import type { AnymatchFn } from 'vite'

	export let graph: RawGraph
	// action
	function setup(node: HTMLDivElement, graph: RawGraph) {
		const ogma = new Ogma({
			container: node.getAttribute('id'),
			graph: graph
		})
		// add styles
		ogma.styles.addNodeRule({
			text: {
				content: (node) => node.getData('Name'),
				position: 'center',
				color: 'white'
			}
		})

		ogma.layouts.force({ locate: true })
		return {
			update(count: number) {
				return ogma
					.addGraph({
						nodes: [{ id: count }],
						edges: [{ source: 0, target: count }]
					})
					.then(() => ogma.layouts.force({ locate: true }))
			},
			destroy() {
				// kill ogma instance when the container is removed from DOM
				return ogma.destroy()
			}
		}
	}
</script>

<div id="container" use:setup={graph}></div>

<style>
	#container {
		width: 90%;
		height: 90%;
		margin: auto;
		border: 1px solid #ccc;
	}
</style>
