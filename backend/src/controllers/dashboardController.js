import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

export const getAdminStats = async (req, res) => {
  try {
    const orderFilter = { isDeleted: false };

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      partnerUsers,
      unreadMessages,
      statusAggregation,
      revenueAggregation,
      recentOrders,
      recentMessages
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(orderFilter),
      Order.countDocuments({ ...orderFilter, status: 'pending' }),
      User.countDocuments({ role: 'partner' }),
      Message.countDocuments({ recipientId: req.user.userId, isRead: false }),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { ...orderFilter, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find(orderFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name company email')
        .lean(),
      Message.find({ recipientId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('senderId', 'name company email')
        .lean()
    ]);

    const statusBreakdown = statusAggregation.reduce(
      (acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalAmount: item.total
        };
        return acc;
      },
      { pending: { count: 0, totalAmount: 0 }, confirmed: { count: 0, totalAmount: 0 }, rejected: { count: 0, totalAmount: 0 } }
    );

    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemsCount: Array.isArray(order.items) ? order.items.length : 0,
      user: order.userId
        ? {
            name: order.userId.name,
            company: order.userId.company,
            email: order.userId.email
          }
        : null
    }));

    const formattedRecentMessages = recentMessages.map((message) => ({
      id: message._id,
      subject: message.subject,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: message.senderId
        ? {
            name: message.senderId.name,
            company: message.senderId.company,
            email: message.senderId.email
          }
        : null
    }));

    const totalRevenue = revenueAggregation[0]?.total ?? 0;

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      partnerUsers,
      totalRevenue,
      unreadMessages,
      statusBreakdown,
      recentOrders: formattedRecentOrders,
      recentMessages: formattedRecentMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas do admin', error: error.message });
  }
};
