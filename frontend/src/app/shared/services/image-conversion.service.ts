import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageConversionService {
  
  decodeBase64Image(base64Image: string): Blob {
    const base64Arr = base64Image.split(',');
    const imageType = base64Arr[0].match(/:(.*?);/)?.[1] || '';
    const byteString = atob(base64Arr[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: imageType });
  }

  async convertImageToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Image = reader.result?.toString() || '';
        resolve(base64Image);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }
}
