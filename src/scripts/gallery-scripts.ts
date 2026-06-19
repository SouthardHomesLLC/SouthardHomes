import { v2 as cloudinary } from 'cloudinary';

//Define interface for gallery items
interface GalleryItem {
  url: string;
  largeUrl: string;
  publicId: string;
  date: Date;
  width: number;
  height: number;
}

//Pull Cloudinary credentials from environment variables, supporting both Vite and Astro conventions for server-side secrets
const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.SECRET_CLOUDINARY_API_KEY || process.env.SECRET_CLOUDINARY_API_KEY;
const apiSecret = import.meta.env.SECRET_CLOUDINARY_API_SECRET || process.env.SECRET_CLOUDINARY_API_SECRET;

//Initialize Cloudinary SDK with secure configuration
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

//Fetch all images from the "SHLLC-Gallery" folder, including context and metadata for EXIF date parsing
const { resources } = await cloudinary.search
  .expression('folder:SHLLC-Gallery')
  .with_field('context')  
  .with_field('image_metadata') 
  .max_results(100)
  .execute();

//Transform Cloudinary API results into our GalleryItem format, applying optimizations and safe EXIF parsing
const galleryItems: GalleryItem[] = resources.map((image: any) => {
  //Use SDK url builder to correctly bundle flags, avoiding manual text replacement bugs
  const largeUrlWithExif = cloudinary.url(image.public_id, {
    secure: true,
    flags: 'keep_iptc',
    quality: 80,
    resource_type: 'image'
  });

  //For the gallery thumbnail, we want a smaller, optimized version that still respects the original aspect ratio
  const optimizedUrl = cloudinary.url(image.public_id, {
    secure: true,
    crop: 'fill',
    width: 640,
    height: 360,
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto',
    resource_type: 'image'
  });

  //Helper function to safely parse Cloudinary's "YYYY:MM:DD HH:MM:SS" EXIF string format
  const parseExifDate = (exifStr: string) => {
    const formattedStr = exifStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    return new Date(formattedStr);
  };

  //Catch undefined metadata or fallback gracefully to image creation time
  const itemDate = (image.image_metadata?.DateTimeOriginal)
  ? parseExifDate(image.image_metadata.DateTimeOriginal)
  : new Date(image.created_at);

  return {
    url: optimizedUrl,
    largeUrl: largeUrlWithExif, 
    publicId: image.public_id,
    width: image.width,
    height: image.height,
    date: itemDate
  };
});

//Sort from newest to oldest
export const sortedGallery = galleryItems.sort((a: GalleryItem, b: GalleryItem) => b.date.getTime() - a.date.getTime());