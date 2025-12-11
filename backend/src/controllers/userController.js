import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, company, phone, role = 'partner', partnerPercentage = 35 } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
      company,
      phone,
      role,
      partnerPercentage: [30, 35, 40].includes(Number(partnerPercentage)) ? Number(partnerPercentage) : 35
    });

    await user.save();

    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Usuário desativado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, partnerPercentage: user.partnerPercentage },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        partnerPercentage: user.partnerPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Não autenticado' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Não autenticado' });
    const { name, phone, company } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, company, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Perfil atualizado', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Retorna todos os usuários. Opcionalmente permitir query ?role=partner|admin
    const { role } = req.query;
    const filter = role && ['partner', 'admin'].includes(role) ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, phone, company, role, partnerPercentage } = req.body;

    const update = { name, phone, company, updatedAt: new Date() };

    if (req.user?.role === 'admin' && partnerPercentage !== undefined) {
      const pct = Number(partnerPercentage);
      if (![30, 35, 40].includes(pct)) {
        return res.status(400).json({ message: 'Percentual inválido. Use 30, 35 ou 40.' });
      }
      update.partnerPercentage = pct;
    }

    // Apenas administrador pode alterar role e somente para valores válidos
    if (req.user?.role === 'admin' && role && ['partner', 'admin'].includes(role)) {
      // Impedir rebaixar qualquer usuário administrador para partner
      const target = await User.findById(req.params.id).select('role');
      if (!target) return res.status(404).json({ message: 'Usuário não encontrado' });
      if (target.role === 'admin' && role === 'partner') {
        return res.status(400).json({ message: 'Não é permitido rebaixar um administrador.' });
      }
      // Bloquear alteração do próprio admin para partner (defensivo)
      if (req.user.userId === req.params.id && role === 'partner') {
        return res.status(400).json({ message: 'Um administrador não pode rebaixar seu próprio papel.' });
      }
      update.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('role');
    if (!target) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (target.role === 'admin') {
      return res.status(400).json({ message: 'Não é permitido desativar um administrador.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Usuário desativado', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desativar usuário', error: error.message });
  }
};

export const setActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Parâmetro isActive inválido' });
    }

    const target = await User.findById(req.params.id).select('role');
    if (!target) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (target.role === 'admin' && isActive === false) {
      return res.status(400).json({ message: 'Não é permitido desativar um administrador.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: isActive ? 'Usuário ativado' : 'Usuário desativado', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status', error: error.message });
  }
};
