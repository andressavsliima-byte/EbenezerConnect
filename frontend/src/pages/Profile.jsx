import { useState, useEffect, useRef } from 'react';
import { authAPI, ordersAPI, uploadAPI } from '../api';
import { User, Mail, Building, Phone, Save, AlertCircle, CheckCircle, ShoppingBag, Calendar, Image as ImageIcon, Eye } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowAvatarModal(false);
    };
    if (showAvatarModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAvatarModal]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        company: response.data.company || '',
        phone: response.data.phone || '',
        avatarUrl: response.data.avatarUrl || ''
      });
      // Carregar pedidos do usuário (tudo que comprou)
      const ordersResp = await ordersAPI.getMine();
      setOrders(ordersResp.data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      
      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...userData, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao atualizar perfil.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Mostrar preview local imediato
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);

      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadAPI.uploadImage(fd) // fallback if avatar route blocked
        .catch(async () => uploadAPI.uploadImage(fd));
      const url = res.data?.url || res.data?.imageUrl;
      if (url) {
        // Normalizar URL caso venha relativa
        const normalized = /^https?:\/\//.test(url) ? url : (url.startsWith('/') ? url : `/${url}`);
        setFormData(prev => ({ ...prev, avatarUrl: normalized }));
        setMessage({ type: 'success', text: 'Foto enviada. Clique em Salvar para aplicar.' });
        // Limpar preview local se já temos URL do servidor
        URL.revokeObjectURL(localUrl);
        setAvatarPreview('');
      } else {
        // Não exibir mensagens vermelhas; manter silencioso
        setMessage({ type: '', text: '' });
      }
    } catch (error) {
      console.error('Erro ao enviar avatar:', error);
      // Não exibir mensagens vermelhas
      setMessage({ type: '', text: '' });
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarMenu((prev) => !prev);
  };

  const handleViewAvatar = () => {
    setShowAvatarMenu(false);
    // Abrir janelinha pequena mesmo sem avatar (mostra placeholder)
    setShowAvatarModal(true);
  };

  const handleChangeAvatar = () => {
    setShowAvatarMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

  return (
    <div className="container-page max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Meu Perfil
      </h1>

      {message.text && message.type === 'success' && (
        <div className={`alert alert-success mb-6 flex items-center`}>
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações do Usuário */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div ref={avatarRef} className="relative w-28 h-28 rounded-md mx-auto mb-2 border bg-white cursor-pointer" onClick={handleAvatarClick} title="Opções de foto">
              {formData.avatarUrl ? (
                <img src={avatarPreview || formData.avatarUrl} alt="Avatar" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-ebenezer-green flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {/* Indicador discreto opcional */}
              <div className="absolute bottom-1 right-1 bg-white/90 rounded-full p-1 shadow pointer-events-none">
                <ImageIcon className="w-4 h-4 text-gray-700" />
              </div>
              {/* Menu de opções: visualizar ou trocar */}
              {showAvatarMenu && (
                <div className="absolute -bottom-1 right-10 bg-white border rounded-md shadow-lg text-sm z-10">
                  <button type="button" className="px-3 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={handleViewAvatar}>
                    <Eye className="w-4 h-4" /> Visualizar foto
                  </button>
                  <button type="button" className="px-3 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={handleChangeAvatar}>
                    <ImageIcon className="w-4 h-4" /> Trocar foto
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              {/* Modal movido para fora do container do avatar para evitar corte */
              }
            </div>
            {/* Texto visível fora do avatar para leitura pelo parceiro */}
            <div className="text-xs text-gray-600 text-center mb-4">
              Toque na imagem para abrir em janelinha e ler o conteúdo.
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {user?.name}
            </h2>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Building className="w-4 h-4" />
                  <span>{user?.company || 'Não informado'}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}`}>
                {user?.role === 'admin' ? 'Administrador' : 'Parceiro'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Editar Informações
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="company" className="label">
                  <Building className="w-4 h-4 inline mr-2" />
                  Empresa
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="input"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className={`w-full ${saving ? 'btn-disabled' : 'btn-primary'} flex items-center justify-center gap-2`}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Informações Adicionais */}
          <div className="card mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Informações da Conta
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Tipo de Conta:</span>
                <span className="font-semibold">
                  {user?.role === 'admin' ? 'Administrador' : 'Parceiro'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Membro desde:</span>
                <span className="font-semibold">
                  {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última atualização:</span>
                <span className="font-semibold">
                  {new Date(user?.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Pedidos do Usuário */}
          <div className="card mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Minhas Compras
            </h3>
            {orders.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhum pedido realizado ainda.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order._id} className="border rounded-lg p-3 bg-white hover:shadow-sm transition flex flex-col gap-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' : order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status === 'pending' ? 'Pendente' : order.status === 'confirmed' ? 'Confirmado' : 'Rejeitado'}
                      </span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-700">Total:</span>
                      <span className="font-semibold text-ebenezer-green">R$ {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs flex justify-between text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{order.items.reduce((sum, it) => sum + it.quantity, 0)} item(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Janelinha central de visualização com X, fora do avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[1000]" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAvatarModal(false)}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white border rounded-md shadow-2xl w-[300px] p-3 relative">
              <button type="button" aria-label="Fechar" className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAvatarModal(false)}>×</button>
              {formData.avatarUrl || avatarPreview ? (
                <img src={avatarPreview || formData.avatarUrl} alt="Avatar" className="w-full h-auto rounded" />
              ) : (
                <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
