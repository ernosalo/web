
import { SupportedFormat, ConversionResult } from '../types';

export const convertImage = async (
  file: File,
  targetFormat: SupportedFormat,
  quality: number = 0.8
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Handle transparency for JPEG (fill white)
        if (targetFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${targetFormat}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const nameParts = file.name.split('.');
              nameParts.pop();
              const filename = `${nameParts.join('.')}.${targetFormat}`;
              resolve({ url, blob, filename });
            } else {
              reject(new Error('Conversion failed'));
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
