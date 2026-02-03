import User from '../models/User.js';
import PartnerLevel from '../models/PartnerLevel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const resolvePartnerLevel = async (levelId) => {
  if (!levelId) return null;
  try {
    const level = await PartnerLevel.findById(levelId);
    return level || null;
  } catch (_) {
    return null;
  }
};

const getDefaultPartnerLevel = async () => {
  let explicit = await PartnerLevel.findOne({ isDefault: true });
  if (explicit) return explicit;

  const count = await PartnerLevel.countDocuments();
  if (count === 0) {
    const seeds = [
      { name: 'Nível 1', percentage: 20, isDefault: true },
      { name: 'Nível 2', percentage: 30 },
      { name: 'Nível 3', percentage: 40 }
    ];
    await PartnerLevel.insertMany(seeds);
    explicit = await PartnerLevel.findOne({ isDefault: true });
    if (explicit) return explicit;
  }

  return PartnerLevel.findOne().sort({ percentage: 1 });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, company, phone, role = 'partner', partnerPercentage = 35, partnerLevel: partnerLevelId } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const levelDoc = (await resolvePartnerLevel(partnerLevelId)) || (await getDefaultPartnerLevel());
    const sanitizedPct = Number(partnerPercentage);
    const fallbackPct = Number.isFinite(sanitizedPct) ? Math.max(0, Math.min(500, sanitizedPct)) : 35;

    // Criar usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
      company,
      phone,
      role,
      partnerLevel: levelDoc?._id || null,
      partnerPercentage: levelDoc ? null : fallbackPct
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

    const user = await User.findOne({ email }).populate('partnerLevel', 'name percentage isDefault');
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

    const effectivePartnerPercentage = user.partnerLevel?.percentage ?? user.partnerPercentage ?? null;
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        partnerPercentage: effectivePartnerPercentage,
        partnerLevelId: user.partnerLevel?._id
      },
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
        partnerPercentage: effectivePartnerPercentage,
        partnerLevel: user.partnerLevel
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
    const user = await User.findById(userId)
      .select('-password')
      .populate('partnerLevel', 'name percentage isDefault');
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
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Parceiros não podem editar o perfil. Contate um administrador.' });
    }
    const { name, phone, company } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, company, updatedAt: new Date() },
      { new: true }
    )
      .select('-password')
      .populate('partnerLevel', 'name percentage isDefault');
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
    const users = await User.find(filter)
      .select('-password')
      .populate('partnerLevel', 'name percentage isDefault');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('partnerLevel', 'name percentage isDefault');
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
    const { name, phone, company, role, partnerPercentage, partnerLevel } = req.body;

    const update = { name, phone, company, updatedAt: new Date() };

    if (req.user?.role === 'admin' && partnerPercentage !== undefined) {
      const pct = Number(partnerPercentage);
      if (!Number.isFinite(pct)) {
        return res.status(400).json({ message: 'Percentual inválido.' });
      }
      if (pct < 0 || pct > 500) {
        return res.status(400).json({ message: 'Percentual fora do intervalo permitido (0-500%).' });
      }
      update.partnerPercentage = pct;
    }

    if (req.user?.role === 'admin' && partnerLevel !== undefined) {
      const levelDoc = await resolvePartnerLevel(partnerLevel);
      update.partnerLevel = levelDoc ? levelDoc._id : null;
      // Se o nível for definido, zera o percentual customizado para usar o nível
      if (levelDoc) {
        update.partnerPercentage = null;
      }
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
    )
      .select('-password')
      .populate('partnerLevel', 'name percentage isDefault');

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
