<script lang="ts">
	import Viewer from '$lib/viewer.svelte'
	import { setContext } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	setContext('graphId', data.id)
	setContext('graphType', 'Model')
</script>

<Viewer graphData={{ rawGraph: data.rawGraph, id: data.id }} />

<style>
</style>
