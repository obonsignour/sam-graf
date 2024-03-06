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
		height: 50%;
		min-width: 10rem;
		flex-direction: column;
		justify-content: flex-start;
		border: 1px solid #b30505;
		background-color: #555555;
		padding: 1rem;
		color: white;
	}
</style>
