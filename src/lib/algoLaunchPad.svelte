<script lang="ts">
	import { onMount } from 'svelte'
	import type { LinkTypes } from '$lib/customTypes'
	import { page } from '$app/stores'
	import { appName, activeThreads, nbActiveThreads } from '$lib/generalStore'
	import { enhance } from '$app/forms'

	export let relationShipTypes: LinkTypes = []
	export let isOpen: boolean = false
	export let algo: string = ''

	let isMounted = false
	let launchpad: HTMLDialogElement

	let selectedTypes: string[] = []
	let statusMessage: string = ''

	onMount(() => {
		launchpad = document.getElementById('launchpad') as HTMLDialogElement
		isMounted = true
	})

	const showLaunchPad = () => {
		launchpad.showModal()
	}

	const closeLaunchPad = () => {
		isOpen = false
		launchpad.close()
	}

	let taskId: number = 0

	const computeAlgo = async () => {
		console.log('Computing algo with selected types:', selectedTypes, $page.params.graphType)
		if (selectedTypes.length === 0) {
			statusMessage = 'Please select at least one link type'
			return
		}

		const response = await fetch(`/API/Algos/${algo}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				linkTypes: selectedTypes,
				appName: $appName,
				graphType: $page.params.graphType,
				graphId: $page.params.graphId
			})
		})
		const responseText = JSON.parse(await response.text())
		taskId = responseText.taskId
		$activeThreads.push(taskId)
		$nbActiveThreads = $activeThreads.length
		closeLaunchPad()
	}

	$: isMounted ? (isOpen ? showLaunchPad() : closeLaunchPad()) : null
	// $: poll(taskId)
</script>

<dialog id="launchpad">
	<h1>Algo Launch Pad Test</h1>
	<p>Here you can select the link types you want to use for the algorithm</p>
	<form method="POST" action="#" use:enhance>
		<ul>
			{#each relationShipTypes as relType}
				<li>
					<label>
						<input type="checkbox" name="selectedTypes" bind:group={selectedTypes} value={relType.label} />
						{relType.label}
					</label>
				</li>
			{/each}
		</ul>
		<p>
			You have selected: {selectedTypes.join(', ')}
		</p>
		/{#if statusMessage !== '' && statusMessage !== undefined}
			<p>{statusMessage}</p>
		{/if}
		<button on:click={computeAlgo}>Compute algo</button>
		<button on:click={() => closeLaunchPad()}>Cancel</button>
	</form>
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
