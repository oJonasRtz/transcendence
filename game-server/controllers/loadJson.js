import { readFile } from 'fs/promises';
import { types } from 'util';

export async function loadJson(file) {
	try {
		if (file.endsWith('.json') === false)
			throw new Error(types.error.TYPE_ERROR);
		const data = await readFile(file, 'utf-8');
		const obj = JSON.parse(data);

		console.log(`loadJson: successfully loaded ${obj}`);
		return obj;
	} catch (error) {
		console.error(`loadJson: error loading JSON file: ${error.message}`);
		return null;
	}
}
