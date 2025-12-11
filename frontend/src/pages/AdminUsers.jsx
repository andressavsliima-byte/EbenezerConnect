import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, authAPI } from '../api';
import { Users, Edit, Trash2, X, Save, Plus, Mail, Building, Phone, ArrowLeft } from 'lucide-react';
import FeedbackDialog from '../components/FeedbackDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    role: 'partner',
  });
  const [feedback, setFeedback] = useState({ open: false, type: 'info', title: '', message: '', autoClose: 3000 });
  const [confirmDeletion, setConfirmDeletion] = useState({ open: false, userId: null, userName: '', loading: false });
  // Determinar se usuário logado é admin para habilitar edição de role
  const reqUserIsAdmin = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed?.role === 'admin';
    } catch (_) {
      return false;
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');

  useEffect(() => {
    fetchUsers();
  }, []);

  const showFeedback = ({ type = 'info', title = '', message = '', autoClose }) => {
    const duration = typeof autoClose === 'number' ? autoClose : (type === 'error' ? 0 : 3000);
    setFeedback({ open: true, type, title, message, autoClose: duration });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error?.response?.data || error?.message || error);
      // Suprimir modal de erro: manter estado vazio silencioso
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'todos' && u.role !== roleFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.company || '').toLowerCase().includes(term)
    );
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        company: user.company || '',
        phone: user.phone || '',
        role: user.role || 'partner',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        company: '',
        phone: '',
        role: 'partner',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Ao editar, não enviar senha se estiver vazia
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersAPI.update(editingUser._id, updateData);
        showFeedback({ type: 'success', title: 'Usuário atualizado', message: 'As informações foram salvas com sucesso.' });
      } else {
        // Ao criar, senha é obrigatória
        if (!formData.password) {
          showFeedback({ type: 'error', title: 'Dados incompletos', message: 'Informe uma senha para criar o usuário.' });
          return;
        }
        await authAPI.register({
          ...formData,
          role: formData.role === 'admin' ? 'admin' : 'partner',
        });
        showFeedback({ type: 'success', title: 'Usuário criado', message: 'O novo usuário foi cadastrado com sucesso.' });
      }
      
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error?.response?.data || error?.message || error);
      const message = error?.response?.data?.message
        || (error?.message ? String(error.message) : 'Não conseguimos salvar as alterações. Tente novamente.');
      showFeedback({ type: 'error', title: 'Erro ao salvar', message });
    }
  };

  const requestDelete = (user) => {
    setConfirmDeletion({ open: true, userId: user._id, userName: user.name || '', loading: false });
  };

  const cancelDelete = () => {
    if (confirmDeletion.loading) return;
    setConfirmDeletion({ open: false, userId: null, userName: '', loading: false });
  };

  const confirmDelete = async () => {
    const { userId, userName } = confirmDeletion;
    if (!userId) return;

    setConfirmDeletion(prev => ({ ...prev, loading: true }));

    try {
      await usersAPI.delete(userId);
      setConfirmDeletion({ open: false, userId: null, userName: '', loading: false });
      showFeedback({ type: 'success', title: 'Usuário excluído', message: `${userName || 'O usuário'} foi removido da base.` });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      const message = error?.response?.data?.message || 'Não foi possível excluir o usuário. Tente novamente.';
      showFeedback({ type: 'error', title: 'Erro ao excluir', message });
      setConfirmDeletion(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/admin');
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
    <div className="container-page">
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
            Gerenciar Usuários
          </h1>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            className="input flex-1"
            placeholder="Buscar por nome, e-mail ou empresa"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Tipo:</label>
          <select
            className="input"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="partner">Parceiros</option>
            <option value="admin">Admins</option>
          </select>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setRoleFilter('todos'); }}
            className="btn-outline"
          >
            Limpar
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum usuário cadastrado
          </h2>
          <p className="text-gray-600 mb-6">
            Comece criando seu primeiro usuário parceiro
          </p>
          <button onClick={() => openModal()} className="btn-primary">
            Criar Usuário
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>Telefone</th>
                <th>Tipo</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="font-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.company || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.role === 'admin' ? 'Admin' : 'Parceiro'}</td>
                  <td className="whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          try {
                            const nextStatus = !user.isActive;
                            await usersAPI.setActive(user._id, nextStatus);
                            setUsers((prev) => prev.map(u => {
                              if (u._id === user._id) {
                                return { ...u, isActive: nextStatus };
                              }
                              return u;
                            }));
                            showFeedback({
                              type: 'success',
                              title: nextStatus ? 'Usuário ativado' : 'Usuário desativado',
                              message: `O usuário ${user.name} agora está ${nextStatus ? 'ativo' : 'inativo'} no sistema.`
                            });
                          } catch (e) {
                            console.error('Erro ao alterar status:', e);
                            const message = e?.response?.data?.message || 'Não foi possível alterar o status do usuário.';
                            showFeedback({ type: 'error', title: 'Falha ao atualizar status', message });
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                        title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => requestDelete(user)}
                        className="text-red-500 hover:text-red-700"
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
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nome Completo *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-mail *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">
                    Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                  </label>
                  <input
                    name="password"
                    type="password"
                    required={!editingUser}
                    className="input"
                    placeholder={editingUser ? 'Deixe em branco para não alterar' : 'Senha do usuário'}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Se admin estiver editando, permitir mudar tipo; ao criar sempre permitido */}
                {(reqUserIsAdmin() || !editingUser) && (
                  <div>
                    <label className="label">Tipo de usuário</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="role"
                          value="partner"
                          checked={formData.role === 'partner'}
                          onChange={handleChange}
                        />
                        Parceiro
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={formData.role === 'admin'}
                          onChange={handleChange}
                        />
                        Admin
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">
                    <Building className="w-4 h-4 inline mr-2" />
                    Empresa
                  </label>
                  <input
                    name="company"
                    type="text"
                    className="input"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    className="input"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDeletion.open}
        title="Excluir usuário"
        message={`Tem certeza de que deseja excluir ${confirmDeletion.userName || 'este usuário'}? Essa ação é permanente.`}
        confirmLabel={confirmDeletion.loading ? 'Excluindo...' : 'Sim, excluir'}
        cancelLabel="Cancelar"
        variant="danger"
        loading={confirmDeletion.loading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <FeedbackDialog
        open={feedback.open}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        autoClose={feedback.autoClose}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
