import { useState, useEffect, useRef } from 'react';
import { authAPI, ordersAPI } from '../api';
import { User, Mail, Building, Phone, Save, AlertCircle, CheckCircle, ShoppingBag, Calendar, Eye } from 'lucide-react';
import TopSearchBar from '../components/TopSearchBar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  
  // Gera uma cor a partir de uma string para manter consistência por usuário
  const colors = ['#F87171','#FB923C','#F59E0B','#FACC15','#84CC16','#10B981','#14B8A6','#06B6D4','#60A5FA','#6366F1','#A78BFA','#F472B6'];
  const getColorFromString = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };
  const getInitials = (name = '') => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const formatDate = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('pt-BR');
  };
  const formatPhone = (phone = '') => {
    const digits = (phone || '').toString().replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    // decide split: if rest length <=8 use 4-4, else use 5-4
    if (rest.length <= 8) {
      const first = rest.slice(0, 4);
      const second = rest.slice(4);
      return `(${ddd}) ${first}${second ? '-' + second : ''}`;
    }
    const first = rest.slice(0, 5);
    const second = rest.slice(5);
    return `(${ddd}) ${first}${second ? '-' + second : ''}`;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowAvatarModal(false);
    };
    if (showAvatarModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAvatarModal]);

  // Limpa a mensagem de sucesso após 5 segundos
  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [message]);
  
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
        phone: formatPhone(response.data.phone || ''),
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
    const { name, value } = e.target;
    if (name === 'phone') {
      // normalize digits then format
      const digits = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: formatPhone(digits) });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // enviar telefone sem máscara
      const payload = { ...formData, phone: (formData.phone || '').toString().replace(/\D/g, '') };
      const response = await authAPI.updateProfile(payload);
      
      // Atualizar localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...userData, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      // garantir que o formulário mostre o telefone formatado
      setFormData(prev => ({ ...prev, phone: formatPhone(response.data.phone || prev.phone) }));
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
    // Upload de avatar removido — função mantida apenas para compatibilidade caso chamada por acidente
    return;
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
    // upload removido
    setShowAvatarMenu(false);
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
    <>
      <TopSearchBar withLogo hideSearch value={searchText} onChange={setSearchText} onSubmit={() => {}} />
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
            <div ref={avatarRef} className="relative w-28 h-28 rounded-md mx-auto mb-2 border cursor-pointer" onClick={handleAvatarClick} title="Avatar">
              <div className="w-full h-full flex items-center justify-center" style={{ background: getColorFromString(formData.email || formData.name), borderRadius: '0.5rem' }}>
                <span className="text-white font-bold text-2xl">{getInitials(formData.name || user?.name || '')}</span>
              </div>
              
            </div>
            {/* espaço reservado removido (mensagem explicativa eliminada) */}
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
                { (formData.phone || user?.phone) && (
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{formData.phone || formatPhone(user.phone)}</span>
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
                  {formatDate(user?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última atualização:</span>
                <span className="font-semibold">
                  {formatDate(user?.updatedAt)}
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
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(order.createdAt)} {(() => { const d = new Date(order.createdAt); return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); })()}</span>
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
              <div className="w-full h-36 rounded flex items-center justify-center" style={{ background: getColorFromString(formData.email || formData.name) }}>
                <span className="text-white font-bold text-4xl">{getInitials(formData.name || user?.name || '')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
