import type { RawGraph } from '@linkurious/ogma';
import type { PageServerLoad, Actions } from './$types';
import { env } from '$env/dynamic/private';
import type { selectElement } from '$lib/selector.svelte';
import { json } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const { appName} = params;
	if (!appName) {
		return { status: 404 };
	}
	const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/ApplicationGraph`);
	const graph: RawGraph = await res.json();

	const res2 = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/ApplicationGraph/LinkTypes`);
	const results: [{ relationType: string }] = await res2.json();

	const relationsTypes: selectElement[] = results.map((linkType) => {
		const element: selectElement = { value: linkType.relationType, label: linkType.relationType };
		return element;
	});

	return { graph: graph, relationsTypes: relationsTypes };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const { appName} = params;
		const data = await request.formData();
		const selectedItems = JSON.parse(data.get('selectedItems') as string);

		console.log(`Selected items for ${appName}:`, selectedItems);

		// Forward the data to the external server
		const dataToSend = {
			relationTypesSelected: selectedItems,
		};

		const response = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/ApplicationGraph/LinkTypes/Selected`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(dataToSend),
		});

		if (!response.ok) {
			console.error('Failed to submit selections');
			return json({ success: false, error: 'Failed to submit selections' });
		}
    
		return json({ success: true });
	},
} satisfies Actions;
