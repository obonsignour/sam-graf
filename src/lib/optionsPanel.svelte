<script lang="ts">
	import { appName } from './generalStore'
</script>

<div id="options" class="options">
	<h1>{$appName}</h1>
	{#if $appName !== 'undefined'}
		<a href="/Applications/{$appName}/Objects">Display objects</a>
		<a href="/Applications/{$appName}/Levels/3">Back to levels</a>
		<p class="action"><a href="/Applications/{$appName}/DataGraphs">DataGraphs</a></p>
		<p class="action"><a href="/Applications/{$appName}/Transactions">Transactions</a></p>
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
</style>
