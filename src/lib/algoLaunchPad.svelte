<script lang="ts">
	import { onMount } from 'svelte'
	import type { LinkType, LinkTypes } from './customTypes'
	import { relationType } from './generalStore'

	export let relationShipTypes: LinkTypes = []
	export let isOpen: boolean = false

	let isMounted = false
	let launchpad: HTMLDialogElement

	let selectedTypes: string[] = []

	onMount(() => {
		launchpad = document.getElementById('launchpad') as HTMLDialogElement
		isMounted = true
	})

	const showLaunchPad = () => {
		launchpad.showModal()
	}

	const closeLaunchPad = () => {
		isOpen = false
		/* TODO: either launch the computation of the algo when closing the dialog (will need to add a CANCEL button for when the user doesn't want to run the algo) or when the user clicks on the RUN button
		means we need to have the name of the algo passed as a prameter to launchPad or we select the algo in launchPad
		 */
		console.log('Selected types:', selectedTypes)
		launchpad.close()
	}

	$: isMounted ? (isOpen ? showLaunchPad() : closeLaunchPad()) : null
</script>

<dialog id="launchpad">
	<h1>Algo Launch Pad</h1>
	<p>Here you can select the link types you want to use for the algorithm</p>
	<ul>
		{#each relationShipTypes as relType}
			<li>
				<label>
					<input type="checkbox" bind:group={selectedTypes} value={relType.label} />
					{relType.label}
				</label>
			</li>
		{/each}
	</ul>
	<p>
		You have selected: {selectedTypes.join(', ')}
	</p>
	<button autofocus on:click={() => closeLaunchPad()}>Close</button>
</dialog>

<style>
	ul {
		list-style: none;
	}

	li {
		margin: 0.5rem 0;
	}

	input[type='checkbox'] {
		margin-right: 0.5rem;
	}
</style>
