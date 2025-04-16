<script lang="ts">
	import type { Thread } from './customTypes'
	import { activeThreads, nbActiveThreads, appName } from './generalStore'
	import { fade, slide } from 'svelte/transition';

	let pollMessages: { id: number; text: string }[] = []
	let isPanelCollapsed = false;
	
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
	
	const togglePanel = () => {
		isPanelCollapsed = !isPanelCollapsed;
	}
</script>

<div id="options" class="options" class:collapsed={isPanelCollapsed}>
	<button class="toggle-btn" on:click={togglePanel} title={isPanelCollapsed ? "Expand panel" : "Collapse panel"}>
		<i class="fas fa-{isPanelCollapsed ? 'chevron-right' : 'chevron-left'}"></i>
	</button>
	
	{#if !isPanelCollapsed}
		<div class="panel-content" transition:slide={{ duration: 200 }}>
			<a href="/Applications/{$appName}" class="app-name-link" title={$appName}>
				<h1 class="app-name">{$appName}</h1>
			</a>
			
			{#if $appName !== 'undefined'}
				<nav class="nav-links">
					<a href="/Applications/{$appName}/DataGraphs" class="nav-link">
						<i class="fas fa-project-diagram"></i>
						<span>DataGraphs</span>
					</a>
					<a href="/Applications/{$appName}/Transactions" class="nav-link">
						<i class="fas fa-exchange-alt"></i>
						<span>Transactions</span>
					</a>
				</nav>

				{#if nbThreads > 0}
					<div class="thread-status">
						<div class="thread-header">
							<i class="fas fa-cog fa-spin"></i>
							<span>{nbThreads} algo{nbThreads > 1 ? 's' : ''} running</span>
						</div>
						
						{#each pollMessages as message}
							<div class="thread-item" transition:fade>
								{message.text}
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.options {
		display: flex;
		height: 100%;
		width: 16rem; /* Increased from 10rem for better readability */
		flex-direction: column;
		border: 1px solid #b30505;
		background-color: #f8f8f8;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
		position: relative;
		transition: width 0.3s ease;
	}
	
	.options.collapsed {
		width: 2rem;
	}
	
	.panel-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}
	
	.toggle-btn {
		position: absolute;
		top: 1rem;
		right: -12px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #b30505;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
	}
	
	.app-name-link {
		text-decoration: none;
		color: inherit;
		margin-bottom: 1.5rem;
	}
	
	.app-name {
		font-size: 1.3rem;
		font-weight: 600;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #b30505;
	}
	
	.nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	
	.nav-link {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: #333;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	
	.nav-link:hover {
		background-color: #e9e9e9;
	}
	
	.nav-link i {
		margin-right: 0.75rem;
		width: 1rem;
		text-align: center;
	}
	
	.thread-status {
		margin-top: auto;
		padding: 0.75rem;
		background-color: #f0f0f0;
		border-radius: 4px;
		font-size: 0.9rem;
	}
	
	.thread-header {
		display: flex;
		align-items: center;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	
	.thread-header i {
		margin-right: 0.5rem;
		color: #b30505;
	}
	
	.thread-item {
		padding: 0.5rem;
		margin-top: 0.25rem;
		background-color: rgba(179, 5, 5, 0.05);
		border-left: 3px solid #b30505;
		border-radius: 2px;
		font-size: 0.85rem;
	}
</style>