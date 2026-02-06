'use server';

export async function createMatch(formData: FormData) {
  const rawFormData = {
    userId: formData.get('userId'),
    message: formData.get('message'),
    status: formData.get('status'),
  }
  console.log('Creating match with data:', rawFormData);
}
