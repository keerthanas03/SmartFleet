const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary into specified folder.
 * Gracefully falls back to a reliable base64 DataURI if Cloudinary credentials are mock/invalid.
 * @param {Buffer} buffer
 * @param {String} originalname
 * @param {String} folder
 * @returns {Promise<string>} Secure URL or formatted DataURI
 */
const uploadToCloudinary = (buffer, originalname = 'file', folder = 'smartfleet/verification') => {
  return new Promise((resolve, reject) => {
    const isConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('your_') &&
      !process.env.CLOUDINARY_API_KEY.includes('123456');

    if (!isConfigured) {
      console.warn('[SmartFleet Cloudinary] Credentials not fully configured. Using secure DataURI fallback for document preview.');
      // Extract mime type from extension
      const ext = originalname.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'pdf') mimeType = 'application/pdf';
      const base64 = buffer.toString('base64');
      return resolve(`data:${mimeType};base64,${base64}`);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.warn('[SmartFleet Cloudinary] Upload stream error, falling back to DataURI:', error.message);
          const ext = originalname.split('.').pop().toLowerCase();
          let mimeType = 'image/jpeg';
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'pdf') mimeType = 'application/pdf';
          const base64 = buffer.toString('base64');
          return resolve(`data:${mimeType};base64,${base64}`);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
