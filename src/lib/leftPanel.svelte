<script lang="ts">
	import type { Thread } from './customTypes'
	import { activeThreads, nbActiveThreads, appName } from './generalStore'

	let pollMessages: { id: number; text: string }[] = []
	const poll = async function () {
		console.log('Starting the polling')
		while ($activeThreads.length > 0) {
			pollMessages = []
			for (let i = 0; i < $activeThreads.length; i++) {
				const thread: Thread = $activeThreads[i]
				const taskId = thread.id
				console.log('In Poll - Polling server for task ', taskId)
				const message = `${thread.label} (id: ${thread.id}) since ${(Date.now() - thread.startDate).toLocaleString()}ms`
				pollMessages = [...pollMessages, { id: taskId, text: message }]
				let response = await fetch(`/API/Algos/Tasks/${taskId}`, { method: 'GET' })
				if (response.status === 200) {
					$activeThreads.splice(i, 1)
					$nbActiveThreads = $activeThreads.length
					pollMessages = pollMessages.filter((message) => message.id !== taskId)
				}
			}
			if ($activeThreads.length > 0) {
				await wait(3000)
			}
		}
	}

	const wait = function (ms = 1000) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	}
	let nbThreads = 0

	$: if ($nbActiveThreads > 0) poll()
	$: nbThreads = $nbActiveThreads
</script>

<div id="options" class="options">
	<h1>{$appName}</h1>
	{#if $appName !== 'undefined'}
		<a href="/Applications/{$appName}/Objects">Display objects</a>
		<a href="/Applications/{$appName}/Levels/3">Back to levels</a>
		<p class="action"><a href="/Applications/{$appName}/DataGraphs">DataGraphs</a></p>
		<p class="action"><a href="/Applications/{$appName}/Transactions">Transactions</a></p>
		{#if nbThreads > 0}
			{nbThreads} algo(s) running

			{#each pollMessages as message}
				<div class="thread-spinner">{message.text}</div>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.options {
		display: flex;
		height: 100%;
		min-width: 10rem;
		max-width: 10rem;
		flex-direction: column;
		justify-content: flex-start;
		border: 1px solid #b30505;
		background-color: #f0f0f0;
		padding: 1rem;
		text-overflow: ellipsis;
	}

	.options a {
		margin: 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.thread-spinner {
	}
</style>
