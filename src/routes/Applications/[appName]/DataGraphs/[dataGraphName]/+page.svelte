<script lang="ts">
	import { appName, pageTitle, relationType } from '$lib/generalStore';
	import Viewer from '$lib/viewer.svelte';
	import type { PageData } from './$types';
	import AnotherSelector from '$lib/anotherSelector/+page.svelte';

	export let data: PageData;

	$: $pageTitle = `DataGraph ${data.name} for ${$appName}`;

	let selected = new Set<string>();

	function toggleSelection(value: string) {
		if (selected.has(value)) {
			selected.delete(value);
		} else {
			selected.add(value);
		}
		$relationType = Array.from(selected).join(', ');
	}

	async function submitSelections(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData();
		formData.set('selectedItems', JSON.stringify(Array.from(selected)));

		const response = await fetch(form.action, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			console.error('Failed to submit selections');
		} else {
			console.log('Selections submitted successfully');
		}
	}
</script>

{#if data.graph}
	<Viewer rawGraph={data.graph} />
{:else}
	<div>Select an application</div>
{/if}

<div class="content">
	{#await data.relationsTypes}
		<span>Waiting for the links to be downloaded</span>
	{:then relationsTypes}
		{#if relationsTypes}
			<form on:submit={submitSelections} action="#" method="post">
				<details class="custom-select">
					<summary>Select link types</summary>
					<ul>
						{#each relationsTypes as element}
							<li>
								<label>
									<input type="checkbox" value={element.value} on:change={() => toggleSelection(element.value)} checked={selected.has(element.value)} />
									{element.label}
								</label>
							</li>
						{/each}
					</ul>
				</details>
				<button type="submit">Submit</button>
			</form>
		{:else}
			<p>No links found</p>
		{/if}
	{/await}
</div>

<style>
	.content {
		position: fixed;
		top: 0;
		right: 0;
		margin: 1rem;
		background: rgba(255, 255, 255, 0.8);
		padding: 1rem;
		border: 1px solid #ccc;
	}

	.custom-select {
		margin: 0 1rem;
		width: calc(10rem * var(--scale, 1));
		font-size: 1rem;
		position: relative;
		display: inline-block;
	}

	.custom-select summary {
		cursor: pointer;
		list-style: none;
	}

	.custom-select ul {
		position: absolute;
		left: 0;
		top: 100%;
		background: white;
		border: 1px solid #ccc;
		padding: 0.5rem;
		margin: 0;
		list-style: none;
		width: 100%;
		max-height: 200px;
		overflow-y: auto;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		z-index: 1;
	}

	.custom-select li {
		margin: 0.5rem 0;
	}

	.custom-select input[type="checkbox"] {
		margin-right: 0.5rem;
	}
</style>
