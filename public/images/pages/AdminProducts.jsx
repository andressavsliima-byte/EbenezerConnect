import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, uploadAPI, settingsAPI } from '../api';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  AlertCircle,
  ArrowLeft,
  RefreshCcw
} from 'lucide-react';
import { getPrimaryProductImage } from '../utils/productUtils';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

// Removido bloqueio de chaves antigas relacionadas a metais
const LEGACY_SPEC_KEYS = [];
const DEFAULT_CURRENCY = 'BRL';

const generateId = () => Math.random().toString(36).slice(2, 10);

const parseDecimalInput = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const trimmed = String(value).trim();
  if (!trimmed) return 0;
  const sanitized = trimmed.replace(/\s+/g, '');
  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');
  if (hasComma && hasDot) {
    const normalized = sanitized.replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const normalized = sanitized.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDecimalForInput = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    const fixed = value.toFixed(4);
    const trimmed = fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return trimmed.replace('.', ',');
  }
  const str = String(value).trim();
  return str;
};

const roundCurrency = (value) => {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const convertToBRL = (value, currency, usdToBrl) => {
  const numeric = parseDecimalInput(value);
  if (numeric <= 0) return 0;
  const usdRate = parseDecimalInput(usdToBrl);
  if (String(currency).toUpperCase() === 'USD') {
    return roundCurrency(numeric * (usdRate > 0 ? usdRate : 0));
  }
  return roundCurrency(numeric);
};

const normalizeNameKey = (value) => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const findMetalRate = (config, name) => {
  if (!config?.metalRates?.length) return null;
  const key = normalizeNameKey(name);
  if (!key) return null;
  return (
    config.metalRates.find((rate) => {
      const rateName = normalizeNameKey(rate.metalName ?? rate.name);
      if (rateName === key) return true;
      if (rate.legacyKey && normalizeNameKey(rate.legacyKey) === key) return true;
      if (Array.isArray(rate.aliases) && rate.aliases.some((alias) => normalizeNameKey(alias) === key)) return true;
      return false;
    }) || null
  );
};

// Removido cálculo automático por metais

const formatCurrencyBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(roundCurrency(value));

// Sem linhas de metais

const buildSpecsObject = (specList) => {
  const specsObject = {};
  (specList || []).forEach((item) => {
    const key = (item.key ?? '').trim();
    if (!key) return;
    if (LEGACY_SPEC_KEYS.includes(key)) return;
    specsObject[key] = (item.value ?? '').toString().trim();
  });
  return specsObject;
};
export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, product: null, loading: false });
  // Removidas configurações e linhas de metais

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    images: [],
    specifications: {},
    purchasePanelStyle: 'highlight'
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [specList, setSpecList] = useState([]);

  // Helpers para acessar/atualizar especificações nomeadas
  const getSpecValue = (key) => {
    const item = specList.find((s) => s.key === key);
    return item ? item.value : '';
  };

  const setSpecValue = (key, value) => {
    setSpecList((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx === -1) return [...prev, { key, value }];
      const next = [...prev];
      next[idx] = { ...next[idx], value };
      return next;
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error?.response?.data || error?.message || error);
      // Não exibir alerta modal; apenas mostrar estado vazio de forma silenciosa.
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Removido fetch de configuração de metais
  // Removido cálculo automático de preço por metais

  // Removido gerenciamento de configuração de metais

  // Removido botão de recalcular preços por metais
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Removidos manipuladores de linhas de metais

  // Removidos manipuladores de configuração de metais

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await uploadAPI.uploadImage(uploadFormData);
      const rawUrl = response.data.imageUrl || response.data.url;
      let imageUrl = rawUrl || '';
      if (imageUrl.startsWith('http')) {
        try {
          const u = new URL(imageUrl);
          imageUrl = u.pathname;
        } catch (_) {
          imageUrl = imageUrl.replace(/^https?:\/\/[^/]+/, '');
        }
      } else if (!imageUrl.startsWith('/')) {
        imageUrl = `/${imageUrl}`;
      }
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));
      setUploadMessage('Imagem enviada com sucesso');
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      setUploadMessage('Erro ao enviar imagem. Tente novamente.');
      setTimeout(() => setUploadMessage(''), 4000);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setAsCover = (index) => {
    setFormData((prev) => {
      const imgs = [...(prev.images || [])];
      if (index < 0 || index >= imgs.length) return prev;
      const [img] = imgs.splice(index, 1);
      imgs.unshift(img);
      return { ...prev, images: imgs };
    });
  };

  const addSpecification = () => {
    const key = (newSpec.key || '').trim();
    const value = (newSpec.value || '').trim();
    if (!key || !value) return;
    setSpecList((prev) => [...prev, { key, value }]);
    setNewSpec({ key: '', value: '' });
  };

  const removeSpecification = (index) => {
    setSpecList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecItem = (index, patch) => {
    setSpecList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      const specifications = product.specifications || {};
      const entries = specifications && typeof specifications === 'object'
        ? Object.entries(specifications)
        : specifications instanceof Map
          ? Array.from(specifications.entries())
          : [];
      const additionalSpecs = entries
        .filter(([key]) => !LEGACY_SPEC_KEYS.includes(key))
        .map(([key, value]) => ({ key, value: String(value ?? '') }));
      setSpecList(additionalSpecs);

      // Removida importação dos metais no formulário

      setFormData({
        name: product.name ?? '',
        description: product.description ?? '',
        brand: product.brand ?? '',
        price: product.price ? product.price.toFixed(2) : '',
        stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
        category: product.category ?? '',
        sku: product.sku ?? '',
        images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
        specifications,
        purchasePanelStyle: product.purchasePanelStyle || 'highlight'
      });
    } else {
      setEditingProduct(null);
      setSpecList([]);
      setFormData({
        name: '',
        description: '',
        brand: '',
        price: '',
        stock: '',
        category: '',
        sku: '',
        images: [],
        specifications: {},
        purchasePanelStyle: 'highlight'
      });
    }
    setNewSpec({ key: '', value: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNewSpec({ key: '', value: '' });
    setSpecList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Removido bloco de composição de metais e cálculo automático

    try {
      const specsObject = buildSpecsObject(specList);
      const payload = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        // Preço agora é informado manualmente
        price: parseDecimalInput(formData.price),
        stock: Number.parseInt(formData.stock, 10) || 0,
        category: formData.category,
        sku: formData.sku,
        images: formData.images || [],
        specifications: specsObject,
        purchasePanelStyle: formData.purchasePanelStyle || 'highlight',
        // metalComposition removido do cadastro
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, payload);
        setToast({ type: 'success', message: 'Produto atualizado com sucesso!' });
      } else {
        await productsAPI.create(payload);
        setToast({ type: 'success', message: 'Produto criado com sucesso!' });
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      const backendMsg = (error && error.response && error.response.data && (error.response.data.error || error.response.data.message)) || '';
      const message = backendMsg || (error instanceof Error ? error.message : 'Erro ao salvar produto. Tente novamente.');
      setToast({ type: 'error', message });
      setTimeout(() => setToast({ type: '', message: '' }), 3500);
    }
  };

  const requestDeleteProduct = (product) => {
    setConfirmDialog({ open: true, product, loading: false });
  };

  const cancelDeleteProduct = () => {
    if (confirmDialog.loading) return;
    setConfirmDialog({ open: false, product: null, loading: false });
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDialog.product) return;
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await productsAPI.delete(confirmDialog.product._id);
      setConfirmDialog({ open: false, product: null, loading: false });
      setToast({ type: 'success', message: 'Produto excluído com sucesso!' });
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
      setToast({ type: 'error', message: 'Erro ao excluir produto. Tente novamente.' });
    }
  };
  if (loading) {
    return (
      <div className="container-page">
        <div className="flex justify-center items-center py-20">
          <div className="spinner w-16 h-16"></div>
        </div>
      </div>
    );
  }

  // Removidos displays de preço/peso por metais

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="container-page">
      <Toast
        type={toast.type || 'info'}
        message={toast.message}
        onClose={() => setToast({ type: '', message: '' })}
      />

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Voltar para a tela anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Gerenciar Produtos
          </h1>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Lista de Produtos */}
      <div className="card overflow-x-auto mb-8">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="font-semibold">{p.name}</td>
                <td className="text-ebenezer-green font-bold">{p.price ? formatCurrencyBRL(p.price) : '—'}</td>
                <td>{p.stock}</td>
                <td>{p.category || '—'}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => requestDeleteProduct(p)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Produto Simplificado */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6" /> {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nome</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="input" required />
                  </div>
                  <div>
                    <label className="label">Marca</label>
                    <input name="brand" value={formData.brand} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Categoria</label>
                    <input name="category" value={formData.category} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className="label">SKU</label>
                    <input name="sku" value={formData.sku} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Estoque</label>
                    <input name="stock" value={formData.stock} onChange={handleChange} className="input" type="number" min="0" />
                  </div>
                  <div>
                    <label className="label">Preço (R$)</label>
                    <input name="price" value={formData.price} onChange={handleChange} className="input" placeholder="Ex.: 210,00" />
                  </div>
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="input min-h-[120px] resize-y" />
                </div>
                {/* Upload de Imagens */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Imagens</h3>
                    <div className="flex items-center gap-3">
                      <label className="btn-outline cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        {uploading ? 'Enviando...' : 'Enviar imagem'}
                      </label>
                    </div>
                  </div>
                  {uploadMessage && (
                    <div className="text-sm text-gray-600">{uploadMessage}</div>
                  )}
                  {Array.isArray(formData.images) && formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((img, index) => (
                          <div key={`${img}-${index}`} className="border rounded-lg p-2 bg-white flex flex-col">
                            <div className="relative h-28 sm:h-32 bg-white rounded-md overflow-hidden flex items-center justify-center">
                            <img
                              src={img}
                              alt={`Imagem ${index + 1}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <button type="button" className="text-emerald-600 text-sm hover:text-emerald-700" onClick={() => setAsCover(index)}>
                              Definir capa
                            </button>
                            <button type="button" className="text-red-600 text-sm hover:text-red-700" onClick={() => removeImage(index)}>
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma imagem enviada ainda.</p>
                  )}
                </div>
                {/* Ficha Técnica */}
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-gray-900">Ficha Técnica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Modelo</label>
                      <input
                        className="input"
                        value={getSpecValue('Modelo')}
                        onChange={(e) => setSpecValue('Modelo', e.target.value)}
                        placeholder="Ex.: XYZ-200"
                      />
                    </div>
                    <div>
                      <label className="label">Código</label>
                      <input
                        className="input"
                        value={getSpecValue('Código')}
                        onChange={(e) => setSpecValue('Código', e.target.value)}
                        placeholder="Ex.: COD-001"
                      />
                    </div>
                    <div>
                      <label className="label">Peso</label>
                      <input
                        className="input"
                        value={getSpecValue('Peso')}
                        onChange={(e) => setSpecValue('Peso', e.target.value)}
                        placeholder="Ex.: 1,250 kg"
                      />
                    </div>
                    {/* Campos Torque e Tipo removidos conforme solicitado */}
                    {/* Metais preciosos: quantidade */}
                    <div>
                      <label className="label">Platina (quantidade)</label>
                      <input
                        className="input"
                        value={getSpecValue('Platina')}
                        onChange={(e) => setSpecValue('Platina', e.target.value)}
                        placeholder="Ex.: 0,250 g"
                      />
                    </div>
                    <div>
                      <label className="label">Paládio (quantidade)</label>
                      <input
                        className="input"
                        value={getSpecValue('Paládio')}
                        onChange={(e) => setSpecValue('Paládio', e.target.value)}
                        placeholder="Ex.: 0,120 g"
                      />
                    </div>
                    <div>
                      <label className="label">Ródio (quantidade)</label>
                      <input
                        className="input"
                        value={getSpecValue('Ródio')}
                        onChange={(e) => setSpecValue('Ródio', e.target.value)}
                        placeholder="Ex.: 0,030 g"
                      />
                    </div>
                  </div>
                </div>
                {/* Seção de metais removida conforme solicitado */}
                <div className="flex gap-4 justify-end pt-4">
                  <button type="button" onClick={closeModal} className="btn-outline">Cancelar</button>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" /> Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar Exclusão"
        message={confirmDialog.product ? `Excluir o produto "${confirmDialog.product.name}"?` : ''}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        loading={confirmDialog.loading}
        onConfirm={confirmDeleteProduct}
        onCancel={cancelDeleteProduct}
      />

    </div>
  );
}
