import Message from '../models/Message.js';

export const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.userId, deletedAt: null })
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
    const messages = await Message.find({ senderId: req.user.userId, deletedAt: null })
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
    const isRead = typeof req.body?.isRead === 'boolean' ? req.body.isRead : true;
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId, deletedAt: null },
      { isRead },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    res.json({ message: isRead ? 'Mensagem marcada como lida' : 'Mensagem marcada como não lida', message });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar mensagem', error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.user.userId,
      isRead: false,
      deletedAt: null
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

    const message = await Message.findOne({ _id: req.params.id, recipientId: req.user.userId, deletedAt: null });
    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Mensagem movida para a lixeira com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir mensagem', error: error.message });
  }
};

export const getTrashMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.userId, deletedAt: { $ne: null } })
      .populate('senderId', 'name company email')
      .populate('orderId')
      .sort({ deletedAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar lixeira', error: error.message });
  }
};

export const restoreMessage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada na lixeira' });
    }

    res.json({ message: 'Mensagem restaurada', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao restaurar mensagem', error: error.message });
  }
};

export const hardDeleteMessage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const message = await Message.findOne({ _id: req.params.id, recipientId: req.user.userId });
    if (!message) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    await message.deleteOne();

    res.json({ message: 'Mensagem excluída permanentemente' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir permanentemente', error: error.message });
  }
};
