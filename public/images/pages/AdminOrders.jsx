import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api';
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Eye,
  X,
  AlertCircle,
  Trash2,
  RotateCcw
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [trash, setTrash] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializa a visualização com base no query param ?trash=true
    const params = new URLSearchParams(location.search);
    const openTrash = params.get('trash');
    if (openTrash === 'true' || openTrash === '1') {
      setShowTrashModal(true);
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    if (showTrashModal) {
      fetchTrash();
    }
  }, [showTrashModal]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error?.response?.data || error.message);
      // Ao invés de mostrar um toast vermelho quando não há pedidos
      // ou ocorre um erro de listagem, apenas mantenha a UI de estado vazio.
      // Opcionalmente, poderíamos diferenciar por status (ex.: 401/500),
      // mas para cumprir o pedido, suprimimos o toast aqui.
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await ordersAPI.getTrash();
      setTrash(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar lixeira:', e?.response?.data || e.message);
      setToast({ type: 'error', message: e?.response?.data?.message || 'Erro ao carregar lixeira.' });
    }
  };

  const openModal = (order, action) => {
    setSelectedOrder(order);
    setActionType(action);
    setAdminNote('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setActionType('');
    setAdminNote('');
  };

  const openTrashModal = () => {
    setShowTrashModal(true);
    const params = new URLSearchParams(location.search);
    params.set('trash', 'true');
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const closeTrashModal = () => {
    setShowTrashModal(false);
    const params = new URLSearchParams(location.search);
    params.delete('trash');
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const handleMoveToTrash = async (order) => {
    if (!confirm('Mover este pedido para a lixeira?')) return;
    try {
      await ordersAPI.moveToTrash(order._id);
      setToast({ type: 'success', message: 'Pedido movido para a lixeira.' });
      fetchOrders();
      if (showTrashModal) fetchTrash();
    } catch (e) {
      setToast({ type: 'error', message: e?.response?.data?.message || 'Erro ao mover para lixeira.' });
    }
  };

  const handleRestore = async (order) => {
    try {
      await ordersAPI.restore(order._id);
      setToast({ type: 'success', message: 'Pedido restaurado.' });
      fetchTrash();
      fetchOrders();
    } catch (e) {
      setToast({ type: 'error', message: e?.response?.data?.message || 'Erro ao restaurar pedido.' });
    }
  };

  const handleHardDelete = async (order) => {
    if (!confirm('Excluir definitivamente este pedido? Esta ação não pode ser desfeita.')) return;
    try {
      await ordersAPI.hardDelete(order._id);
      setToast({ type: 'success', message: 'Pedido excluído definitivamente.' });
      fetchTrash();
    } catch (e) {
      setToast({ type: 'error', message: e?.response?.data?.message || 'Erro ao excluir definitivamente.' });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
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
    <div className="container-page">
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <AlertCircle className="w-5 h-5" />
          <span>{toast.message}</span>
          <button onClick={() => setToast({ type: '', message: '' })} className="ml-2 opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Gerenciar Pedidos
        </h1>
        <button
          onClick={openTrashModal}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          title="Abrir lixeira"
        >
          <Trash2 className="w-4 h-4" />
          Lixeira
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="flex gap-4 mb-6">
        <div className="card flex-1 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        <div className="card flex-1 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {orders.filter(o => o.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Confirmados</div>
        </div>
        <div className="card flex-1 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {orders.filter(o => o.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejeitados</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum pedido registrado
          </h2>
          <p className="text-gray-600">
            Os pedidos dos parceiros aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold">{order.user?.name}</div>
                      <div className="text-xs text-gray-500">{order.user?.company}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td>{order.items.length}</td>
                  <td className="font-bold text-ebenezer-green">
                    R$ {order.totalAmount.toFixed(2)}
                  </td>
                  <td>
                    <span className={getStatusClass(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(order, 'view')}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal(order, 'confirm')}
                            className="text-green-500 hover:text-green-700"
                            title="Confirmar"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openModal(order, 'reject')}
                            className="text-red-500 hover:text-red-700"
                            title="Rejeitar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleMoveToTrash(order)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Mover para lixeira"
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

      {/* Modal de Detalhes/Ação */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pedido #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Informações do Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Cliente:</h3>
                <p className="text-gray-700">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.company}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
              </div>

              {/* Itens do Pedido */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Itens:</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                        <img
                          src={(item.productId?.images?.[0]) || item.productId?.image || '/images/placeholder.svg'}
                          alt={item.productId?.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.productId?.name || item.name || 'Produto não disponível'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota do Cliente */}
              {selectedOrder.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Observações do Cliente:</h4>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Nota do Admin (se já existe) */}
              {selectedOrder.adminNotes && (
                <div className={`border rounded-lg p-4 mb-6 ${
                  selectedOrder.status === 'confirmed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 mb-2">Sua Resposta:</h4>
                  <p className="text-gray-700">{selectedOrder.adminNotes}</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-ebenezer-green">
                    R$ {selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ações (Confirmar/Rejeitar) */}
              {actionType !== 'view' && selectedOrder.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      {actionType === 'confirm' ? 'Mensagem de Confirmação:' : 'Motivo da Rejeição:'}
                    </label>
                    <textarea
                      className="input min-h-[100px] resize-none"
                      placeholder={
                        actionType === 'confirm' 
                          ? 'Ex: Pedido confirmado! Entraremos em contato em breve.'
                          : 'Ex: Produto fora de estoque no momento.'
                      }
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={processing}
                      className={`flex-1 ${
                        processing 
                          ? 'btn-disabled' 
                          : actionType === 'confirm' 
                            ? 'btn-success' 
                            : 'btn-danger'
                      } flex items-center justify-center gap-2`}
                    >
                      {processing ? (
                        <>
                          <div className="spinner w-5 h-5"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          {actionType === 'confirm' ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Confirmar Pedido
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              Rejeitar Pedido
                            </>
                          )}
                        </>
                      )}
                    </button>
                    <button onClick={closeModal} className="btn-outline flex-1">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'view' && (
                <button onClick={closeModal} className="btn-primary w-full">
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal da Lixeira */}
      {showTrashModal && (
        <div className="modal-overlay" onClick={closeTrashModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-gray-700" /> Lixeira de Pedidos
                </h2>
                <button onClick={closeTrashModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {trash.length === 0 ? (
                <div className="text-center py-12">
                  <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Nenhum pedido na lixeira.</p>
                  <p className="text-xs text-gray-500 mt-2">Pedidos excluídos aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {trash.map((order) => {
                    const totalItems = Array.isArray(order.items)
                      ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                      : 0;
                    const totalAmount = Number(order.totalAmount || 0);

                    return (
                      <div key={order._id} className="card">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Pedido</span>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                                  #{order._id?.slice(-8).toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                {order.deletedAt && (
                                  <span className="text-sm text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                                    Excluído em {new Date(order.deletedAt).toLocaleString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm">
                              <div>
                                <p className="text-gray-500">Cliente</p>
                                <p className="font-semibold text-gray-800">
                                  {order.userId?.name || order.user?.name || 'Cliente removido'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.userId?.company || order.user?.company || 'Razão social não informada'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Itens</p>
                                <p className="font-semibold text-gray-800">{totalItems}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total</p>
                                <p className="font-semibold text-ebenezer-green">
                                  R$ {totalAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                              <span className="font-semibold text-gray-700 mr-2">Nota do cliente:</span>
                              <span>{order.notes}</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-500">
                              <span className="font-semibold text-gray-700">Status atual:</span>{' '}
                              <span>{getStatusText(order.status)}</span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleRestore(order)}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" /> Restaurar
                              </button>
                              <button
                                onClick={() => handleHardDelete(order)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Excluir definitivamente
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={closeTrashModal} className="btn-outline px-6 py-2">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
