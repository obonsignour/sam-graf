<script lang="ts">
	import { appName } from './generalStore'
</script>

<div id="options" class="options">
	<span>This is where the options will be</span>
	<a href="/Applications/{$appName}/Levels/3">Back to levels</a>
	<a href="/Applications/{$appName}/Objects">Display objects</a>
</div>

<style>
	.options {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: flex-start;

		background-color: #555555;
		padding: 1rem;
		color: white;
	}
</style>
