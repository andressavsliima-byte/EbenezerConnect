import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Construir URL completa usando host da requisição (útil para frontend carregar direto)
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      message: 'Imagem carregada com sucesso',
      url: imageUrl,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar imagem', error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    // Validar que filename não contém path traversal
    if (filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Filename inválido' });
    }

    const filePath = path.join(uploadsDir, filename);

    // Garantir que estamos deletando apenas dentro de uploads/
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({ message: 'Acesso negado' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Imagem deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar imagem', error: error.message });
  }
};
