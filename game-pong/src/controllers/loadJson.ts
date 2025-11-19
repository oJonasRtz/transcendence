import fs from 'fs/promises';

export async function loadJson<T>(file: string): Promise<T | null> {
	try {
		if (file.endsWith('.json') === false)
			throw new Error('Invalid file type');
		
		const data = await fs.readFile(file, 'utf-8');

		return JSON.parse(data);
	} catch (error) {
		return null;
	}
}