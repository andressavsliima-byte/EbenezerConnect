import PromoBanner from '../models/PromoBanner.js';

export const listPublic = async (req, res) => {
  try {
    const items = await PromoBanner.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar banners', error: err.message });
  }
};

export const listAll = async (req, res) => {
  try {
    const items = await PromoBanner.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar banners', error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const banner = await PromoBanner.create(req.body);
    res.status(201).json({ message: 'Banner criado', banner });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar banner', error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!banner) return res.status(404).json({ message: 'Banner não encontrado' });
    res.json({ message: 'Banner atualizado', banner });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar banner', error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await PromoBanner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner removido' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover banner', error: err.message });
  }
};
