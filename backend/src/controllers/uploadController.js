export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    // Cloudinary já retorna a URL final
    return res.status(200).json({
      message: 'Imagem enviada com sucesso',
      url: req.file.secure_url,     // ✅ URL FINAL
      public_id: req.file.public_id // útil para deletar depois
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao enviar imagem',
      error: error.message
    });
  }
};
