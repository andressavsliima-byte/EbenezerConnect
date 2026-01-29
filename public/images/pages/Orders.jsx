import { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { Package, Clock, CheckCircle, XCircle, Calendar, DollarSign, AlertCircle, X } from 'lucide-react';
import TopSearchBar from '../components/TopSearchBar';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchText, setSearchText] = useState('');
  // Removido toast de erro em pedidos

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getMine();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error?.response?.data || error.message);
      // Silenciar UI: não exibir toast para erros de busca
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="container-page">
        <div className="flex justify-center items-center py-20">
          <div className="spinner w-16 h-16"></div>
        </div>
      </div>
    );
  }

  // Aggregates (confirmed orders considered as "gasto")
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const totalItemsConfirmed = confirmedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalSpentConfirmed = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  return (
    <>
      <TopSearchBar withLogo hideSearch value={searchText} onChange={setSearchText} onSubmit={() => {}} />
      <div className="container-page">
      {/* Toast removido conforme solicitação: não exibir mensagem de erro em pedidos */}
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Meus Pedidos
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Você ainda não fez nenhum pedido
            </h2>
            <p className="text-gray-600">
              Comece a adicionar produtos ao carrinho para fazer seu primeiro pedido
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card">
              {/* Header do Pedido */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Pedido #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={getStatusClass(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      R$ {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                  className="btn-outline mt-4 md:mt-0"
                >
                  {selectedOrder === order._id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                </button>
              </div>

              {/* Itens do Pedido */}
              {selectedOrder === order._id && (
                <div className="space-y-4 animate-fade-in">
                  {/* Lista de Produtos */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Produtos:</h4>
                    {order.items.map((item, index) => (
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
                          <p className="text-xs text-gray-500 mb-1">
                            SKU: {item.productId?.sku || item.sku || '—'}
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

                  {/* Nota do Cliente */}
                  {order.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Suas Observações:</h4>
                      <p className="text-gray-700">{order.notes}</p>
                    </div>
                  )}

                  {/* Resposta do Admin */}
                  {order.adminNotes && (
                    <div className={`border rounded-lg p-4 ${
                      order.status === 'confirmed' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Resposta da Ebenezer:
                      </h4>
                      <p className="text-gray-700">{order.adminNotes}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-ebenezer-green">
                        R$ {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
        </div>
        {/* Sidebar Resumo Geral */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Geral</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Pedidos (total):</span>
                <span className="font-semibold">{totalOrders}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Pedidos confirmados:</span>
                <span className="font-semibold text-green-600">{confirmedOrders.length}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">Produtos comprados:</span>
                <span className="font-semibold">{totalItemsConfirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor gasto:</span>
                <span className="font-semibold text-ebenezer-green">R$ {totalSpentConfirmed.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Somente pedidos confirmados entram no total de produtos e valor gasto.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
