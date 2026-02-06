import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true, // força https
});

export default cloudinary;
