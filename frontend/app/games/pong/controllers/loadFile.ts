
export async function loadFile<T>(filePath: string): Promise<T | null> {
    try {
        const data = await fetch(filePath);

        if (!data.ok)
            throw new Error('Failed to fetch file');

        return data.text() as T;
    } catch (error) {
        return null;
    }
}