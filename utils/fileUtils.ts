import { ImagePart } from './types';

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const fileToGenerativePart = (file: File): Promise<ImagePart> => {
  return new Promise((resolve, reject) => {
    if (!VALID_MIME_TYPES.includes(file.type)) {
      return reject(new Error(`Unsupported file type. Please use one of: ${VALID_MIME_TYPES.join(', ')}`));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      if (base64Data) {
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error('Failed to read file and convert to base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
