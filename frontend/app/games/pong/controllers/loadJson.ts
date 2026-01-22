
export async function loadJson<T>(file: string): Promise<T | null> {
	try {
		if (file.endsWith('.json') === false)
			throw new Error('Invalid file type');
		
		const data = await fetch(file);

		if (!data.ok)
			throw new Error('Failed to fetch JSON file');

		return await data.json() as T;
	} catch (error) {
		return null;
	}
}
