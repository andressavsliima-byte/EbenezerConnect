import PartnerLevel from '../models/PartnerLevel.js';
import User from '../models/User.js';

const sanitizeName = (name) => (name || '').toString().trim();

const ensureSeedLevels = async () => {
  const existing = await PartnerLevel.countDocuments();
  if (existing > 0) return;
  const defaults = [
    { name: 'Nível 1', percentage: 20, isDefault: true },
    { name: 'Nível 2', percentage: 30 },
    { name: 'Nível 3', percentage: 40 }
  ];
  await PartnerLevel.insertMany(defaults);
};

export const listLevels = async (req, res) => {
  try {
    await ensureSeedLevels();
    const levels = await PartnerLevel.find().sort({ percentage: 1, name: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar níveis', error: error.message });
  }
};

export const createLevel = async (req, res) => {
  try {
    const name = sanitizeName(req.body.name);
    const percentage = Number(req.body.percentage);
    const description = (req.body.description || '').toString();

    if (!name) return res.status(400).json({ message: 'Nome do nível é obrigatório' });
    if (!Number.isFinite(percentage)) return res.status(400).json({ message: 'Percentual inválido' });
    if (percentage < 0 || percentage > 500) return res.status(400).json({ message: 'Percentual fora do intervalo permitido (0-500%)' });

    const duplicated = await PartnerLevel.findOne({ name });
    if (duplicated) return res.status(400).json({ message: 'Já existe um nível com esse nome' });

    const level = new PartnerLevel({ name, percentage, description, isDefault: Boolean(req.body.isDefault) });
    await level.save();

    // If set as default, remove default flag from others
    if (level.isDefault) {
      await PartnerLevel.updateMany({ _id: { $ne: level._id }, isDefault: true }, { isDefault: false });
    }

    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar nível', error: error.message });
  }
};

export const updateLevel = async (req, res) => {
  try {
    const levelId = req.params.id;
    const level = await PartnerLevel.findById(levelId);
    if (!level) return res.status(404).json({ message: 'Nível não encontrado' });

    if (req.body.name !== undefined) {
      const name = sanitizeName(req.body.name);
      if (!name) return res.status(400).json({ message: 'Nome do nível é obrigatório' });
      const duplicated = await PartnerLevel.findOne({ name, _id: { $ne: levelId } });
      if (duplicated) return res.status(400).json({ message: 'Já existe um nível com esse nome' });
      level.name = name;
    }

    if (req.body.percentage !== undefined) {
      const pct = Number(req.body.percentage);
      if (!Number.isFinite(pct)) return res.status(400).json({ message: 'Percentual inválido' });
      if (pct < 0 || pct > 500) return res.status(400).json({ message: 'Percentual fora do intervalo permitido (0-500%)' });
      level.percentage = pct;
    }

    if (req.body.description !== undefined) {
      level.description = (req.body.description || '').toString();
    }

    if (req.body.isDefault !== undefined) {
      level.isDefault = Boolean(req.body.isDefault);
      if (level.isDefault) {
        await PartnerLevel.updateMany({ _id: { $ne: level._id }, isDefault: true }, { isDefault: false });
      }
    }

    await level.save();
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar nível', error: error.message });
  }
};

export const deleteLevel = async (req, res) => {
  try {
    const levelId = req.params.id;
    const level = await PartnerLevel.findById(levelId);
    if (!level) return res.status(404).json({ message: 'Nível não encontrado' });

    const inUse = await User.countDocuments({ partnerLevel: levelId });
    if (inUse > 0 && req.query.force !== 'true') {
      return res.status(400).json({ message: 'Nível em uso por parceiros. Use force=true para remover mesmo assim.', inUse });
    }

    if (inUse > 0) {
      await User.updateMany({ partnerLevel: levelId }, { $unset: { partnerLevel: 1 }, updatedAt: new Date() });
    }

    await level.deleteOne();
    res.json({ message: 'Nível removido', removedId: levelId, inUse });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover nível', error: error.message });
  }
};

export const getDefaultLevel = async () => {
  const explicitDefault = await PartnerLevel.findOne({ isDefault: true });
  if (explicitDefault) return explicitDefault;
  const lowest = await PartnerLevel.findOne().sort({ percentage: 1 });
  return lowest;
};
