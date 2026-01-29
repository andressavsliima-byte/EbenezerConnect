import Message from '../models/Message.js';

export const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.userId })
      .populate('senderId', 'name company email')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mensagens', error: error.message });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user.userId })
      .populate('recipientId', 'name')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mensagens', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json({ message: 'Mensagem marcada como lida', message });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar mensagem', error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.user.userId,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao contar mensagens', error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    await message.deleteOne();

    res.json({ message: 'Mensagem excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir mensagem', error: error.message });
  }
};
