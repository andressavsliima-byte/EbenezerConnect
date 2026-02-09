import cloudinary from '../config/cloudinary.js';

/**
 * Upload via multer-storage-cloudinary.
 * O arquivo já chega aqui com:
 *   req.file.path      -> URL (secure_url)
 *   req.file.filename  -> public_id
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const url = req.file.path; // secure url
    const publicId = req.file.filename; // public_id no Cloudinary

    return res.json({
      message: 'Imagem carregada com sucesso',
      url,
      imageUrl: url,
      publicId
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Erro ao enviar imagem', error: error.message });
  }
};

/**
 * Deletar imagem no Cloudinary.
 * Espera receber { publicId } no body.
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body || {};
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ message: 'publicId é obrigatório' });
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return res.json({ message: 'Imagem removida', result });
  } catch (error) {
    console.error('Delete upload error:', error);
    return res.status(500).json({ message: 'Erro ao deletar imagem', error: error.message });
  }
};
