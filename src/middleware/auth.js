import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('name email role isActive partnerPercentage');
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuário desativado' });
    }

    req.user = {
      ...decoded,
      userId: decoded.userId || user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      partnerPercentage: user.partnerPercentage
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Aliases to keep compatibility with older route imports
export const protect = authenticate;

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

export const partnerOnly = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  next();
};

export const admin = adminOnly;
