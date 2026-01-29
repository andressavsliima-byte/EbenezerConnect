import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';
import TopSearchBar from '../components/TopSearchBar';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map(item => (item._id === productId ? { ...item, quantity: newQuantity } : item));

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    // feedback discreto opcional
    setToast({ type: 'success', message: 'Carrinho esvaziado.' });
    setTimeout(() => setToast({ type: '', message: '' }), 2000);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          brand: item.brand,
          sku: item.sku,
        })),
        totalAmount: calculateTotal(),
        customerNote: orderNote,
      };

      await ordersAPI.create(orderData);
      
      // Limpar carrinho
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      setToast({ type: 'success', message: 'Pedido realizado com sucesso! Você receberá uma notificação quando for processado.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
      navigate('/pedidos');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setToast({ type: 'error', message: 'Erro ao finalizar pedido. Tente novamente.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3500);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
      <TopSearchBar withLogo hideSearch value={searchText} onChange={setSearchText} onSubmit={() => {}} />
      <div className="container-page">
        <div className="text-center py-20">
          <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione produtos do catálogo para começar seu pedido
          </p>
          <Link to="/catalogo" className="btn-primary">
            Ir para o Catálogo
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <TopSearchBar withLogo hideSearch value={searchText} onChange={setSearchText} onSubmit={() => {}} />
    <div className="container-page">
      {/* Mobile Header - estilo carrinho */}
      <div className="md:hidden sticky top-0 z-30 -mx-4 px-4">
        <div className="bg-ebenezer-green text-white rounded-b-2xl shadow flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/catalogo')}
            className="text-white/90 hover:text-white font-medium"
          >
            Voltar
          </button>
          <span className="font-semibold">Carrinho ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
          <div className="w-6" />
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Carrinho de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Itens */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="card flex flex-col sm:flex-row gap-4">
              <Link to={`/produto/${item._id}`} className="w-full sm:w-32 h-32 flex-shrink-0">
                <img
                  src={item.image || '/images/placeholder.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </Link>

              <div className="flex-1">
                <Link to={`/produto/${item._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 hover:text-ebenezer-green transition-colors mb-1">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                <p className="text-xl font-bold text-ebenezer-green">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4">
                {/* Controle de Quantidade */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-9 h-9 rounded-lg border border-gray-300 hover:border-ebenezer-green flex items-center justify-center bg-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-300 hover:border-ebenezer-green flex items-center justify-center bg-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal e Remover */}
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Excluir item</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumo do Pedido
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Itens ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-ebenezer-green">R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Nota do Pedido */}
            <div className="mb-6">
              <label className="label">Observações (opcional)</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Adicione observações sobre seu pedido..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>

            <div className="hidden md:flex flex-col" style={{ gap: '0.5cm' }}>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full ${loading ? 'btn-disabled' : 'btn-primary'} flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    Finalizar Pedido
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <Link
                to="/catalogo"
                className="btn-outline w-full text-center"
              >
                Continuar Comprando
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="btn-outline w-full text-center text-red-600 border-red-300 hover:bg-red-50"
              >
                Esvaziar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Mobile summary bar */}
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-4">
      <div className="bg-white border-t border-gray-200 rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">Total</span>
          <span className="text-xl font-bold text-ebenezer-green">R$ {calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full ${loading ? 'btn-disabled' : 'btn-primary'} flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <div className="spinner w-5 h-5"></div>
              Processando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
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
