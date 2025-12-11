import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, settingsAPI } from '../api';
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const emptyStats = {
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  partnerUsers: 0,
  totalRevenue: 0,
  unreadMessages: 0,
  statusBreakdown: {
    pending: { count: 0, totalAmount: 0 },
    confirmed: { count: 0, totalAmount: 0 },
    rejected: { count: 0, totalAmount: 0 }
  },
  recentOrders: [],
  recentMessages: [],
  lowStockProducts: []
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [savingPrices, setSavingPrices] = useState(false);
  const [metalPrices, setMetalPrices] = useState({ platinum: '', palladium: '', rhodium: '' });
  const [toast, setToast] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await dashboardAPI.getStats();
        const data = response.data || {};
        setStats({
          ...emptyStats,
          ...data,
          statusBreakdown: {
            ...emptyStats.statusBreakdown,
            ...(data.statusBreakdown || {})
          },
          recentOrders: data.recentOrders || [],
          recentMessages: data.recentMessages || [],
          lowStockProducts: data.lowStockProducts || []
        });
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchMetalPrices = async () => {
      try {
        const res = await settingsAPI.getMetalPrices();
        const prices = res.data || {};
        setMetalPrices({
          platinum: prices.platinum ?? '',
          palladium: prices.palladium ?? '',
          rhodium: prices.rhodium ?? '',
        });
      } catch (e) {
        console.error('Erro ao carregar preços de metais:', e);
      }
    };
    fetchMetalPrices();
  }, []);

  const saveMetalPrices = async () => {
    setSavingPrices(true);
    try {
      await settingsAPI.updateMetalPrices({
        platinum: Number(metalPrices.platinum || 0),
        palladium: Number(metalPrices.palladium || 0),
        rhodium: Number(metalPrices.rhodium || 0),
      });
      setToast({ type: 'success', message: 'Preços atualizados com sucesso!' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } catch (e) {
      console.error('Erro ao salvar preços:', e);
      setToast({ type: 'error', message: 'Erro ao salvar preços.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } finally {
      setSavingPrices(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="spinner w-16 h-16 border-4"></div>
          <div className="space-y-1">
            <p className="text-slate-700 font-semibold text-lg">Carregando dados do painel</p>
            <p className="text-slate-500 text-sm">Estamos preparando os insights mais recentes para você.</p>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos de métricas
  const totalOrdersCount = stats.totalOrders || 0;
  const confirmedCount = stats.statusBreakdown.confirmed?.count || 0;
  const confirmedRevenue = stats.statusBreakdown.confirmed?.totalAmount || 0;
  const pendingRevenue = stats.statusBreakdown.pending?.totalAmount || 0;
  const avgTicket = confirmedCount ? confirmedRevenue / confirmedCount : 0;
  const approvalRate = totalOrdersCount ? Math.round((confirmedCount / totalOrdersCount) * 100) : 0;
  const conversionTrend = approvalRate >= 60 ? 'up' : approvalRate >= 40 ? 'stable' : 'down';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-500/95 text-white border-emerald-400' 
            : 'bg-rose-500/95 text-white border-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="dashboard-shell container-page">
        {/* Hero Section - Premium Header */}
        <section className="dashboard-hero shadow-2xl mb-10">
          <div className="relative z-10 flex flex-col items-start gap-10 px-8 md:px-12 py-12">
            {/* Left: Title & Actions */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Centro de Controleaba
              </h1>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/pedidos"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-ebenezer-green font-bold px-8 py-4 shadow-xl shadow-emerald-900/30 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  <TrendingUp className="w-5 h-5" />
                  Gerenciar Pedidos
                </Link>
                <Link
                  to="/admin/produtos"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-8 py-4 text-white hover:bg-white/20 hover:border-white transition-all duration-300"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  Novo Produto
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Main Grid - KPIs e Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-10">
          {/* KPIs principais */}
          <div className="xl:col-span-8 space-y-8">
            {/* Métricas operacionais */}
            <div className="glass-panel">
              <SectionHeader
                title="Métricas Operacionais"
                subtitle="KPIs essenciais do negócio"
                icon={BarChart3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Total de Pedidos"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  gradient="from-blue-500 to-cyan-500"
                  link="/admin/pedidos"
                />
                <MetricCard
                  title="Pedidos Pendentes"
                  value={stats.pendingOrders}
                  icon={AlertTriangle}
                  gradient="from-amber-500 to-orange-500"
                  badge={stats.pendingOrders > 5 ? 'Alto' : 'Normal'}
                  link="/admin/pedidos?status=pending"
                />
                <MetricCard
                  title="Parceiros"
                  value={stats.partnerUsers}
                  icon={Users}
                  gradient="from-purple-500 to-pink-500"
                  link="/admin/usuarios"
                />
                <MetricCard
                  title="Mensagens"
                  value={stats.unreadMessages}
                  icon={MessageSquare}
                  gradient="from-rose-500 to-red-500"
                  badge={stats.unreadMessages > 0 ? 'Novo' : null}
                  link="/admin/mensagens"
                />
              </div>
            </div>

            {/* Recent orders */}
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <SectionHeader
                  title="Pedidos Recentes"
                  subtitle="Últimas transações"
                  icon={Zap}
                />
                <Link
                  to="/admin/pedidos"
                  className="text-sm font-semibold text-ebenezer-green hover:text-emerald-700 flex items-center gap-2 group"
                >
                  Ver todos
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              
              {stats.recentOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  message="Nenhum pedido recente"
                  description="Os pedidos aparecerão aqui assim que forem criados"
                />
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Insights & Actions */}
          <div className="xl:col-span-4 space-y-8">
            {/* Metal prices update */}
            <div className="glass-panel">
              <SectionHeader
                title="Preços de Metais"
                subtitle="Atualização diária por quilograma"
                icon={Activity}
              />
              <div className="space-y-4">
                <MetalPriceInput
                  label="Platina"
                  value={metalPrices.platinum}
                  onChange={(val) => setMetalPrices({ ...metalPrices, platinum: val })}
                  color="slate"
                />
                <MetalPriceInput
                  label="Paládio"
                  value={metalPrices.palladium}
                  onChange={(val) => setMetalPrices({ ...metalPrices, palladium: val })}
                  color="gray"
                />
                <MetalPriceInput
                  label="Ródio"
                  value={metalPrices.rhodium}
                  onChange={(val) => setMetalPrices({ ...metalPrices, rhodium: val })}
                  color="zinc"
                />
                <button
                  onClick={saveMetalPrices}
                  disabled={savingPrices}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPrices ? (
                    <>
                      <div className="spinner w-4 h-4 border-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Atualizar e Recalcular
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Low stock alerts */}
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <SectionHeader
                  title="Alertas de Estoque"
                  subtitle="Produtos críticos"
                  icon={AlertTriangle}
                />
                {stats.lowStockProducts?.length > 0 && (
                  <span className="pulse-notification inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                )}
              </div>
              
              {!stats.lowStockProducts || stats.lowStockProducts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  message="Estoque saudável"
                  description="Todos os produtos com níveis adequados"
                />
              ) : (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product) => (
                    <LowStockItem key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent messages */}
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <SectionHeader
                  title="Mensagens Recentes"
                  subtitle="Últimas interações"
                  icon={MessageSquare}
                />
                {stats.unreadMessages > 0 && (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-500 text-white text-xs font-bold">
                    {stats.unreadMessages}
                  </span>
                )}
              </div>
              
              {stats.recentMessages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  message="Nenhuma mensagem"
                  description="As mensagens aparecerão aqui"
                />
              ) : (
                <div className="space-y-3">
                  {stats.recentMessages.slice(0, 5).map((message) => (
                    <MessageItem key={message.id} message={message} />
                  ))}
                </div>
              )}
              
              <Link
                to="/admin/mensagens"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-ebenezer-green hover:bg-emerald-50 hover:text-ebenezer-green transition-all"
              >
                Ver todas as mensagens
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTES ====================

function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ebenezer-green to-teal-500 shadow-lg shadow-emerald-500/30">
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, gradient, badge, link }) {
  const displayValue = typeof value === 'number' ? new Intl.NumberFormat('pt-BR').format(value) : value;
  const CardWrapper = link ? Link : 'div';

  return (
    <CardWrapper
      to={link}
      className="stat-card-premium group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {badge && (
          <span className="badge badge-warning text-[10px] px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <p className="metric-value">{displayValue}</p>
      </div>
      
      {link && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ebenezer-green opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}
    </CardWrapper>
  );
}

function StatusProgress({ label, count, amount, percentage, color, icon: Icon }) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      fill: 'progress-fill',
      icon: 'text-emerald-600'
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      fill: 'progress-fill-amber',
      icon: 'text-amber-600'
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      fill: 'progress-fill-rose',
      icon: 'text-rose-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes.bg}`}>
            <Icon className={`w-5 h-5 ${classes.icon}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">
              {count} pedido{count !== 1 ? 's' : ''} • {currencyFormatter.format(amount)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-extrabold ${classes.text}`}>{percentage}%</span>
          <span className="text-xs text-slate-400">do total</span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div
          className={classes.fill}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function OrderItem({ order }) {
  const statusConfig = {
    confirmed: { badge: 'badge-success', icon: CheckCircle2 },
    pending: { badge: 'badge-warning', icon: AlertCircle },
    rejected: { badge: 'badge-error', icon: XCircle }
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-ebenezer-green hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">
            {order.user?.name?.[0] || 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {order.user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500">
              {order.user?.company || 'Empresa'} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{currencyFormatter.format(order.totalAmount || 0)}</p>
            <p className="text-xs text-slate-500">{order.itemsCount || 0} item(s)</p>
          </div>
          <span className={`badge ${config.badge} flex items-center gap-1.5`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {translateStatus(order.status)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetalPriceInput({ label, value, onChange, color }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label} <span className="text-slate-400">(R$/kg)</span>
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        className="input text-lg font-semibold"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0,00"
      />
    </div>
  );
}

function LowStockItem({ product }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 hover:bg-amber-100/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-600 mt-1">
            SKU: {product.sku || 'N/A'} • {product.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="badge badge-warning font-bold">
            {product.stock} un.
          </span>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message }) {
  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      message.isRead 
        ? 'border-slate-200 bg-white hover:border-slate-300' 
        : 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/50'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">
          {message.sender?.name?.[0] || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-900 truncate">
              {message.sender?.name || 'Usuário'}
            </p>
            {!message.isRead && (
              <span className="flex h-2 w-2 rounded-full bg-rose-500 flex-shrink-0"></span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {message.sender?.company || 'Empresa'} • {new Date(message.createdAt).toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-slate-700 mt-2 line-clamp-2">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-50 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">{message}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}

function translateStatus(status) {
  const translations = {
    confirmed: 'Confirmado',
    rejected: 'Rejeitado',
    pending: 'Pendente'
  };
  return translations[status] || status;
}
