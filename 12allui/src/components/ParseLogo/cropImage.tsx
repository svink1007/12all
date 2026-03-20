import {Area, Size} from 'react-easy-crop/types';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, crop: Area, size: Size): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    alert('Image cropping error');
    return new Promise((resolve, reject) => reject);
  }

  canvas.width = size.width;
  canvas.height = size.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // As Base64 string
  // return canvas.toDataURL('image/png');

  // As a blob
  return new Promise(resolve => canvas.toBlob(resolve));
};

export default getCroppedImg;
