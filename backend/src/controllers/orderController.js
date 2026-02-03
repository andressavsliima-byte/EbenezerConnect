import Order from '../models/Order.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const computePriceForUser = (basePrice, userContext) => {
  const sanitizedBase = Number.isFinite(basePrice) ? basePrice : 0;
  if (!userContext || userContext.role !== 'partner') return sanitizedBase;
  const levelPct = userContext.partnerLevel?.percentage ?? userContext.partnerPercentage ?? 0;
  const pct = Number.isFinite(levelPct) ? Math.max(0, Math.min(500, levelPct)) : 0;
  return Math.round((sanitizedBase * (1 + pct / 100) + Number.EPSILON) * 100) / 100;
};

export const createOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Nenhum item informado' });
    }

    const productIds = items
      .map((it) => it.product || it.productId || it._id)
      .filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    const itemsWithPrice = items.map((item) => {
      const productDoc = products.find((p) => p._id.toString() === (item.product || item.productId || item._id)?.toString());
      const basePrice = productDoc?.price ?? item.price ?? 0;
      const computedPrice = computePriceForUser(basePrice, req.user);
      return {
        productId: productDoc?._id || item.productId || item.product,
        quantity: Number(item.quantity) || 1,
        price: computedPrice,
        name: item.name || productDoc?.name,
        brand: item.brand || productDoc?.brand,
        sku: item.sku || productDoc?.sku
      };
    });

    const totalAmount = itemsWithPrice.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      userId,
      items: itemsWithPrice,
      totalAmount,
      notes
    });

    await order.save();

    // Notificar admin
    const admins = await User.find({ role: 'admin' });
    const senderUser = await User.findById(userId);

    for (const admin of admins) {
      const message = new Message({
        senderId: userId,
        recipientId: admin._id,
        orderId: order._id,
        subject: `Nova compra de ${senderUser.company}`,
        content: `Uma nova compra foi realizada. Total: R$ ${totalAmount.toFixed(2)}`
      });
      await message.save();
    }

    res.status(201).json({ message: 'Pedido criado com sucesso', order });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId, isDeleted: false })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, trash } = req.query;
    let query = { isDeleted: false };
    if (trash === 'true') {
      query = { isDeleted: true };
    }
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name email company')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, adminNotes, updatedAt: new Date() },
      { new: true }
    ).populate('userId');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Notificar usuário sobre a decisão
    const message = new Message({
      senderId: req.user.userId,
      recipientId: order.userId._id,
      orderId: orderId,
      subject: `Sua compra foi ${status}`,
      content: `Admin: ${adminNotes || 'Sem comentários'}`
    });
    await message.save();

    res.json({ message: 'Pedido atualizado', order });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedido', error: error.message });
  }
};

export const moveToTrash = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json({ message: 'Pedido movido para a lixeira', order });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao mover para lixeira', error: error.message });
  }
};

export const restoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null, updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json({ message: 'Pedido restaurado', order });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao restaurar pedido', error: error.message });
  }
};

export const hardDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    if (!order.isDeleted) return res.status(400).json({ message: 'Exclusão definitiva permitida apenas para itens na lixeira' });
    await Order.findByIdAndDelete(id);
    res.json({ message: 'Pedido excluído definitivamente' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir pedido', error: error.message });
  }
};

export const getTrashedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: true })
      .populate('userId', 'name email company')
      .populate('items.productId')
      .sort({ deletedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lixeira', error: error.message });
  }
};
