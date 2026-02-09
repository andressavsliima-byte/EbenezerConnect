// uploadController.js
// Controller de upload usando Cloudinary (SEM arquivos locais)

export const uploadImage = async (req, res) => {
  try {
    // Validação básica
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhuma imagem enviada'
      });
    }

    /**
     * Quando usamos multer-storage-cloudinary,
     * o req.file já vem com:
     * - secure_url → URL final HTTPS do Cloudinary
     * - public_id  → ID interno para deletar a imagem depois
     */

    return res.status(200).json({
      message: 'Imagem enviada com sucesso',
      url: req.file.secure_url,   // ✅ USE SEMPRE ISSO NO FRONTEND
      public_id: req.file.public_id
    });
  } catch (error) {
    console.error('Erro no upload da imagem:', error);

    return res.status(500).json({
      message: 'Erro ao enviar imagem',
      error: error.message
    });
  }
};
