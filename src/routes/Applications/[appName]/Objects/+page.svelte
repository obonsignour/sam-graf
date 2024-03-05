<script lang="ts">
	import Viewer from '$lib/viewer.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<Viewer rawGraph={data.graph} />
