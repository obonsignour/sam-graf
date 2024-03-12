<script lang="ts">
	import { appName, pageTitle } from '$lib/generalStore'
	import type { PageData } from './$types'

	export let data: PageData
	$: $pageTitle = `Transactions for ${$appName}`
</script>

<div class="content">
	{#await data.transactions}
		<dialog>Loading transactions list</dialog>
	{:then transactions}
		{#if transactions}
			<div class="header" id="header_id">Transaction Id</div>
			<div class="header" id="header_name">Transaction Name</div>
			{#each transactions as transaction}
				<div id={transaction.id}><a href="/Applications/{$appName}/Transactions/{transaction.id}">{transaction.id}</a></div>
				<div id={transaction.id}><a href="/Applications/{$appName}/Transactions/{transaction.id}">{transaction.name} </a></div>
			{/each}
		{/if}
	{/await}
</div>

<style>
	.content {
		margin: 1rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.header {
		font-weight: 600;
		font-size: 1.5rem;
	}
</style>
