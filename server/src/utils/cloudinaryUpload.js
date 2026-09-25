import claudinary from '../config/cloudinary.js';
import ApiError from './ApiError.js';

const uploadToClaudinary = async (fileBuffer, folder = 'wanderlog') => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = claudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:best', fetch_format: 'auto' },
            { height: 2000, width: 2000, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else resolve(result);
        },
      );
      uploadStream.end(fileBuffer);
    });
    return result.secure_url;
  } catch (error) {
    throw new ApiError(500, 'failed to upload image');
  }
};
export default uploadToClaudinary;
