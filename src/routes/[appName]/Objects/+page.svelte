<script lang="ts">
	import OgmaComponent from '$lib/ogmaComponent.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<OgmaComponent rawGraph={data.graph} />
