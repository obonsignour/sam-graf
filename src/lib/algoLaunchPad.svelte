<script lang="ts">
	import { getContext, onMount } from 'svelte'
	import type { LinkTypes, Thread } from '$lib/customTypes'
	import { page } from '$app/stores'
	import { appName, activeThreads, nbActiveThreads } from '$lib/generalStore'
	import { enhance } from '$app/forms'

	export let relationShipTypes: LinkTypes = []
	export let isOpen: boolean = false
	export let algo: string = ''
	const graphType = getContext('graphType')
	const graphId = getContext('graphId')

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
		console.log('Computing algo with selected types:', selectedTypes, graphType)
		if (selectedTypes.length === 0) {
			statusMessage = 'Please select at least one link type'
			return
		}
		statusMessage = 'You have selected: ' + selectedTypes.join(', ')
		console.log('GraphId: ', graphId)
		const response = await fetch(`/API/Algos/${algo}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				linkTypes: selectedTypes,
				appName: $appName,
				graphType: graphType,
				graphId: graphId
			})
		})
		if (response.status >= 200 && response.status < 300) {
			// Success
			console.log('Success:', response)
			const responseText = JSON.parse(await response.text())
			taskId = responseText.taskId
			const thread: Thread = { id: taskId, label: algo, startDate: Date.now() }
			$activeThreads = [...$activeThreads, thread]
			$nbActiveThreads = $activeThreads.length
		} else {
			const responseText = JSON.parse(await response.text())
			console.error('Error:', responseText)
		}

		closeLaunchPad()
	}

	$: isMounted ? (isOpen ? showLaunchPad() : closeLaunchPad()) : null
</script>

<dialog id="launchpad">
	<h1>Algo Launch Pad</h1>
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

		{#if statusMessage !== '' && statusMessage !== undefined}
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
