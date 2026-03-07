const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/durh1yv4o/image/upload';
const UPLOAD_PRESET = 'saif_pos_preset';

export const uploadToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  
  // For React Native, we need to handle the file object correctly
  const filename = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename || '');
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);
  
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
