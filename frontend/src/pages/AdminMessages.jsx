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
      await messagesAPI.delete(confirmDialog.message._id);
      setConfirmDialog({ open: false, message: null, loading: false });
      setToast({ type: 'success', message: 'Mensagem excluída com sucesso!' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      setToast({ type: 'error', message: 'Erro ao excluir mensagem.' });
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

  const filteredMessages = messages.filter(msg => {
    if (filter === 'read') return msg.isRead;
    if (filter === 'unread') return !msg.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

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
      <div className="flex gap-4 mb-6">
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
                  <div className="flex items-center gap-3 mb-3">
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
                    <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
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
                      <div className="mt-2 flex gap-2">
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
    <ConfirmDialog
      open={confirmDialog.open}
      title="Excluir mensagem"
      message={`Tem certeza de que deseja excluir a mensagem de ${confirmDialog.message?.name || 'este contato'}? Essa ação é permanente.`}
      confirmLabel={confirmDialog.loading ? 'Excluindo...' : 'Sim, excluir'}
      cancelLabel="Cancelar"
      variant="danger"
      loading={confirmDialog.loading}
      onConfirm={confirmDeleteMessage}
      onCancel={cancelDeleteMessage}
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
