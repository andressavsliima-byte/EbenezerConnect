import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI, ordersAPI } from '../api';
import { MessageSquare, Mail, MailOpen, Trash2, Calendar, User, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState({ open: false, loading: false });
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [trash, setTrash] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashActionId, setTrashActionId] = useState(null);
  const [trashConfirm, setTrashConfirm] = useState({ open: false, message: null, loading: false });
  const [toast, setToast] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: null, loading: false });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getAll();
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setToast({ type: 'error', message: 'Erro ao carregar mensagens.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await messagesAPI.markAsRead(id);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      setToast({ type: 'error', message: 'Erro ao marcar mensagem como lida.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    }
  };

  const requestDeleteMessage = (message) => {
    setConfirmDialog({ open: true, message, loading: false });
  };

  const cancelDeleteMessage = () => {
    if (confirmDialog.loading) return;
    setConfirmDialog({ open: false, message: null, loading: false });
  };

  const confirmDeleteMessage = async () => {
    if (!confirmDialog.message?._id) return;
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      await messagesAPI.moveToTrash(confirmDialog.message._id);
      setConfirmDialog({ open: false, message: null, loading: false });
      setToast({ type: 'success', message: 'Mensagem movida para a lixeira!' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao mover para lixeira:', error);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      setToast({ type: 'error', message: 'Erro ao mover mensagem para a lixeira.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status, `Status alterado para ${status}`);
      setToast({ type: 'success', message: `Pedido marcado como ${status}.` });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setToast({ type: 'error', message: 'Falha ao atualizar status do pedido.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selected) => selected !== id) : [...prev, id]
    );
  };

  const selectAllCurrent = () => {
    const ids = filteredMessages.map((m) => m._id);
    setSelectedIds(ids);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkMarkReadState = async (isRead) => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => messagesAPI.markAsRead(id, isRead)));
      setToast({ type: 'success', message: isRead ? 'Mensagens marcadas como lidas.' : 'Mensagens marcadas como não lidas.' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      clearSelection();
      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar mensagens:', error);
      setToast({ type: 'error', message: 'Falha ao atualizar mensagens selecionadas.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    }
  };

  const openBulkDeleteDialog = () => {
    if (!selectedIds.length) return;
    setBulkConfirm({ open: true, loading: false });
  };

  const cancelBulkDelete = () => {
    if (bulkConfirm.loading) return;
    setBulkConfirm({ open: false, loading: false });
  };

  const confirmBulkDelete = async () => {
    if (!selectedIds.length) return cancelBulkDelete();
    setBulkConfirm({ open: true, loading: true });
    try {
      await Promise.all(selectedIds.map((id) => messagesAPI.moveToTrash(id)));
      setToast({ type: 'success', message: 'Mensagens movidas para a lixeira.' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      clearSelection();
      fetchMessages();
      setBulkConfirm({ open: false, loading: false });
    } catch (error) {
      console.error('Erro ao excluir mensagens:', error);
      setToast({ type: 'error', message: 'Falha ao excluir mensagens selecionadas.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
      setBulkConfirm({ open: true, loading: false });
    }
  };

  const loadTrash = async () => {
    setTrashLoading(true);
    try {
      const { data } = await messagesAPI.getTrash();
      setTrash(data || []);
    } catch (error) {
      console.error('Erro ao carregar lixeira:', error);
      setToast({ type: 'error', message: 'Erro ao carregar lixeira.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } finally {
      setTrashLoading(false);
    }
  };

  const openTrashModal = () => {
    setShowTrashModal(true);
    loadTrash();
  };

  const closeTrashModal = () => {
    setShowTrashModal(false);
  };

  const restoreFromTrash = async (message) => {
    if (!message?._id) return;
    setTrashActionId(message._id);
    try {
      await messagesAPI.restore(message._id);
      setToast({ type: 'success', message: 'Mensagem restaurada.' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      await loadTrash();
      fetchMessages();
    } catch (error) {
      console.error('Erro ao restaurar mensagem:', error);
      setToast({ type: 'error', message: 'Falha ao restaurar mensagem.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } finally {
      setTrashActionId(null);
    }
  };

  const requestHardDelete = (message) => {
    setTrashConfirm({ open: true, message, loading: false });
  };

  const cancelHardDelete = () => {
    if (trashConfirm.loading) return;
    setTrashConfirm({ open: false, message: null, loading: false });
  };

  const confirmHardDelete = async () => {
    if (!trashConfirm.message?._id) return cancelHardDelete();
    setTrashConfirm((prev) => ({ ...prev, loading: true }));
    try {
      await messagesAPI.hardDelete(trashConfirm.message._id);
      setToast({ type: 'success', message: 'Mensagem excluída definitivamente.' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      await loadTrash();
    } catch (error) {
      console.error('Erro ao excluir permanentemente:', error);
      setToast({ type: 'error', message: 'Falha ao excluir permanentemente.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
      setTrashConfirm((prev) => ({ ...prev, loading: false }));
      return;
    }

    setTrashConfirm({ open: false, message: null, loading: false });
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'read') return msg.isRead;
    if (filter === 'unread') return !msg.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const allFilteredSelected =
    filteredMessages.length > 0 && filteredMessages.every((m) => selectedIds.includes(m._id));

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
    <>
    <div className="container-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Voltar para a tela anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mensagens
            </h1>
            <p className="text-gray-600">
            {unreadCount > 0 ? (
              <span className="text-red-500 font-semibold">
                {unreadCount} mensagem{unreadCount !== 1 ? 's' : ''} não lida{unreadCount !== 1 ? 's' : ''}
              </span>
            ) : (
              'Todas as mensagens foram lidas'
            )}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-ebenezer-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-ebenezer-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Não Lidas ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'read'
                ? 'bg-ebenezer-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lidas ({messages.length - unreadCount})
          </button>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto md:ml-auto md:flex-row md:flex-wrap md:items-center">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openTrashModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Lixeira
            </button>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={() => (allFilteredSelected ? clearSelection() : selectAllCurrent())}
                className="h-4 w-4 rounded border-gray-300 text-ebenezer-green focus:ring-ebenezer-green"
              />
              Selecionar todos ({filteredMessages.length})
            </label>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-700">
              <span className="px-2 py-1 bg-gray-100 rounded-full font-semibold">
                {selectedIds.length} selecionada{selectedIds.length > 1 ? 's' : ''}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => bulkMarkReadState(true)}
                  className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                >
                  Marcar lidas
                </button>
                <button
                  onClick={() => bulkMarkReadState(false)}
                  className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                >
                  Marcar não lidas
                </button>
                <button
                  onClick={openBulkDeleteDialog}
                  className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma mensagem
          </h2>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Ainda não há mensagens no sistema'
              : filter === 'unread'
              ? 'Não há mensagens não lidas'
              : 'Não há mensagens lidas'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`card ${
                !message.isRead ? 'border-l-4 border-l-ebenezer-green bg-green-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(message._id)}
                      onChange={() => toggleSelection(message._id)}
                      className="h-4 w-4 rounded border-gray-300 text-ebenezer-green focus:ring-ebenezer-green"
                    />
                    {message.isRead ? (
                      <MailOpen className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-ebenezer-green" />
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-semibold">{message.senderId?.name}</span>
                      <span>•</span>
                      <span>{message.senderId?.email}</span>
                      {message.senderId?.company && (
                        <>
                          <span>•</span>
                          <span className="italic">{message.senderId.company}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 md:ml-auto">
                      <Calendar className="w-4 h-4" />
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
                  </div>

                  {/* Pedido Relacionado */}
                  {message.orderId && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold">Pedido relacionado:</span>{' '}
                      #{message.orderId._id?.slice(-8).toUpperCase()} -{' '}
                      R$ {message.orderId.totalAmount?.toFixed(2)}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <button
                          onClick={() => updateOrderStatus(message.orderId._id, 'pending')}
                          className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700 flex items-center gap-1 hover:bg-yellow-200"
                          title="Marcar como pendente"
                        >
                          <Clock className="w-4 h-4" /> Pendente
                        </button>
                        <button
                          onClick={() => updateOrderStatus(message.orderId._id, 'confirmed')}
                          className="px-3 py-1 text-xs rounded bg-green-100 text-green-700 flex items-center gap-1 hover:bg-green-200"
                          title="Confirmar pedido"
                        >
                          <CheckCircle className="w-4 h-4" /> OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  {!message.isRead && (
                    <button
                      onClick={() => markAsRead(message._id)}
                      className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50"
                      title="Marcar como lida"
                    >
                      <MailOpen className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => requestDeleteMessage(message)}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Modal da Lixeira */}
    {showTrashModal && (
      <div className="modal-overlay" onClick={closeTrashModal}>
        <div className="modal max-w-5xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Lixeira de Mensagens
                </h2>
                <p className="text-sm text-gray-600">Mensagens excluídas ficam aqui até exclusão definitiva.</p>
              </div>
              <button onClick={closeTrashModal} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="border rounded-xl p-4 bg-gray-50">
              {trashLoading ? (
                <div className="flex justify-center py-10">
                  <div className="spinner w-12 h-12" />
                </div>
              ) : trash.length === 0 ? (
                <div className="text-center py-10 text-gray-600">Nenhuma mensagem na lixeira.</div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {trash.map((msg) => (
                    <div key={msg._id} className="card">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-semibold text-gray-800">{msg.senderId?.name}</span>
                          <span>•</span>
                          <span>{msg.senderId?.email}</span>
                          {msg.senderId?.company && (
                            <>
                              <span>•</span>
                              <span className="italic">{msg.senderId.company}</span>
                            </>
                          )}
                          <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-4 h-4" />
                            Removida em {msg.deletedAt ? new Date(msg.deletedAt).toLocaleString('pt-BR') : '-'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-800 whitespace-pre-line">{msg.content}</p>
                        </div>

                        {msg.orderId && (
                          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                            <span className="font-semibold">Pedido relacionado:</span>
                            #{msg.orderId._id?.slice(-8).toUpperCase()} - R$ {msg.orderId.totalAmount?.toFixed(2)}
                          </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => restoreFromTrash(msg)}
                            disabled={trashActionId === msg._id}
                            className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-sm"
                          >
                            {trashActionId === msg._id ? 'Restaurando...' : 'Restaurar'}
                          </button>
                          <button
                            onClick={() => requestHardDelete(msg)}
                            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                          >
                            Excluir definitivamente
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    <ConfirmDialog
      open={confirmDialog.open}
      title="Mover para a lixeira"
      message={`Deseja mover a mensagem de ${confirmDialog.message?.senderId?.name || 'este contato'} para a lixeira?`}
      confirmLabel={confirmDialog.loading ? 'Movendo...' : 'Sim, mover'}
      cancelLabel="Cancelar"
      variant="warning"
      loading={confirmDialog.loading}
      onConfirm={confirmDeleteMessage}
      onCancel={cancelDeleteMessage}
    />

    <ConfirmDialog
      open={bulkConfirm.open}
      title="Excluir mensagens selecionadas"
      message={`Deseja excluir ${selectedIds.length} mensagem${selectedIds.length !== 1 ? 's' : ''}? Essa ação não pode ser desfeita.`}
      confirmLabel={bulkConfirm.loading ? 'Excluindo...' : 'Sim, excluir'}
      cancelLabel="Cancelar"
      variant="danger"
      loading={bulkConfirm.loading}
      onConfirm={confirmBulkDelete}
      onCancel={cancelBulkDelete}
    />

    <ConfirmDialog
      open={trashConfirm.open}
      title="Excluir permanentemente"
      message={`Excluir permanentemente a mensagem de ${trashConfirm.message?.senderId?.name || 'este contato'}? Essa ação não pode ser desfeita.`}
      confirmLabel={trashConfirm.loading ? 'Excluindo...' : 'Sim, excluir'}
      cancelLabel="Cancelar"
      variant="danger"
      loading={trashConfirm.loading}
      onConfirm={confirmHardDelete}
      onCancel={cancelHardDelete}
    />

    {toast.message && (
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: '', message: '' })}
      />
    )}
    </>
  );
}
