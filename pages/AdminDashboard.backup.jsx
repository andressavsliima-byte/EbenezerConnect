import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, settingsAPI } from '../api';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  ArrowUpRight,
  Inbox,
  ShieldCheck,
  Activity
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
      setToast({ type: 'success', message: 'Preços atualizados e produtos recalculados!' });
      setTimeout(() => setToast({ type: '', message: '' }), 2500);
    } catch (e) {
      console.error('Erro ao salvar preços:', e);
      setToast({ type: 'error', message: 'Erro ao salvar preços. Tente novamente.' });
      setTimeout(() => setToast({ type: '', message: '' }), 3000);
    } finally {
      setSavingPrices(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page">
        <div className="card flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="spinner w-12 h-12 border-t-4"></div>
            <p className="text-gray-600 font-medium">Carregando informações do painel...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalOrdersCount = stats.totalOrders || 0;

  const statusMeta = {
    pending: {
      label: 'Pendentes',
      color: 'text-amber-500',
      bg: 'bg-amber-100',
      ring: 'ring-amber-200'
    },
    confirmed: {
      label: 'Confirmados',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      ring: 'ring-emerald-200'
    },
    rejected: {
      label: 'Rejeitados',
      color: 'text-red-500',
      bg: 'bg-red-100',
      ring: 'ring-red-200'
    }
  };

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats.totalProducts,
      icon: Package,
      accent: 'bg-emerald-50 text-emerald-600',
      link: '/admin/produtos'
    },
    {
      title: 'Total de Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      accent: 'bg-blue-50 text-blue-600',
      link: '/admin/pedidos'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: AlertTriangle,
      accent: 'bg-amber-50 text-amber-600',
      link: '/admin/pedidos?status=pending'
    },
    {
      title: 'Usuários Parceiros',
      value: stats.partnerUsers,
      icon: Users,
      accent: 'bg-purple-50 text-purple-600',
      link: '/admin/usuarios'
    },
    {
      title: 'Receita Confirmada',
      value: currencyFormatter.format(stats.totalRevenue || 0),
      icon: DollarSign,
      accent: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Mensagens Não Lidas',
      value: stats.unreadMessages,
      icon: MessageSquare,
      accent: 'bg-rose-50 text-rose-600',
      link: '/admin/mensagens'
    }
  ];

  const confirmedCount = stats.statusBreakdown.confirmed?.count || 0;
  const confirmedVolume = stats.statusBreakdown.confirmed?.totalAmount || stats.totalRevenue || 0;
  const avgTicket = confirmedCount ? confirmedVolume / confirmedCount : 0;
  const approvalRate = totalOrdersCount ? Math.round((confirmedCount / totalOrdersCount) * 100) : 0;
  const pendingWeight = totalOrdersCount ? Math.round((stats.pendingOrders / totalOrdersCount) * 100) : 0;
  const lowStockCount = stats.lowStockProducts?.length || 0;

  const heroHighlights = [
    {
      label: 'Receita confirmada',
      value: currencyFormatter.format(stats.totalRevenue || 0),
      meta: 'Fluxo aprovado',
      trend: `${approvalRate}% taxa de aprovação`,
      tone: approvalRate >= 60 ? 'positive' : 'warning',
      icon: DollarSign
    },
    {
      label: 'Pedidos em análise',
      value: stats.pendingOrders,
      meta: 'Fila atual',
      trend: pendingWeight ? `${pendingWeight}% da carga total` : 'Fila zerada',
      tone: pendingWeight > 40 ? 'warning' : pendingWeight === 0 ? 'positive' : 'neutral',
      icon: Clock
    },
    {
      label: 'Parceiros ativos',
      value: stats.partnerUsers,
      meta: 'Rede homologada',
      trend: `${stats.unreadMessages} mensagens aguardando`,
      tone: stats.unreadMessages > 0 ? 'warning' : 'positive',
      icon: Users
    }
  ];

  const executiveInsights = [
    {
      title: 'Ticket médio aprovado',
      value: currencyFormatter.format(avgTicket || 0),
      detail: `${confirmedCount} pedidos confirmados`,
      icon: ShieldCheck
    },
    {
      title: 'Mensagens em aberto',
      value: stats.unreadMessages,
      detail: 'Responder mantém o SLA em dia',
      icon: MessageSquare
    },
    {
      title: 'Alertas de estoque',
      value: lowStockCount,
      detail: lowStockCount ? 'Produtos abaixo do nível ideal' : 'Todos os itens saudáveis',
      icon: Package
    },
    {
      title: 'Metais sincronizados',
      value: 'Platina • Paládio • Ródio',
      detail: 'Atualize diariamente para refletir o mercado',
      icon: Activity
    }
  ];

  return (
    <div className="container-page dashboard-shell">
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <section className="dashboard-hero text-white shadow-2xl px-8 py-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative z-10 max-w-2xl space-y-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">Centro de Controle</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/pedidos"
              className="inline-flex items-center gap-2 rounded-full bg-white text-ebenezer-green font-semibold px-6 py-3 shadow-lg shadow-emerald-900/20 transition-transform hover:-translate-y-0.5"
            >
              <TrendingUp className="w-4 h-4" />
              Fluxo de pedidos
            </Link>
            <Link
              to="/admin/produtos"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-white/90 hover:bg-white/10"
            >
              <ArrowUpRight className="w-4 h-4" />
              Novo produto
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            Atualizado em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }).format(new Date())}
          </div>
        </div>
        <div className="grid w-full max-w-xl grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {heroHighlights.map((metric) => (
            <HeroMetric key={metric.label} {...metric} />
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-40 blur-3xl bg-emerald-300"></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-panel xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Visão operacional</p>
              <h2 className="text-2xl font-semibold text-slate-900">KPI críticos do negócio</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Dados consolidados do MongoDB
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </div>
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Insights</p>
              <h2 className="text-xl font-semibold text-slate-900">Prioridades do dia</h2>
            </div>
          </div>
          <ul className="insight-list">
            {executiveInsights.map((insight) => (
              <InsightItem key={insight.title} {...insight} />
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="glass-panel">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Analytics</p>
                <h2 className="text-2xl font-semibold text-slate-900">Status dos pedidos</h2>
                <p className="text-sm text-gray-500">Distribuição e valor financeiro por etapa.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-gray-600">
                <BarChart3 className="w-3.5 h-3.5" />
                {totalOrdersCount} pedidos registrados
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.statusBreakdown).map(([key, data]) => {
                const percentage = totalOrdersCount
                  ? Math.round((data.count / totalOrdersCount) * 100)
                  : 0;
                const meta = statusMeta[key];
                return (
                  <div key={key} className="rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${meta?.bg || 'bg-gray-100'} ${meta?.color || 'text-gray-600'}`}>
                          {meta?.label?.[0] || key[0]?.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">{meta?.label || key}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{data.count} pedido(s) • {currencyFormatter.format(data.totalAmount || 0)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${meta?.color?.replace('text-', 'bg-') || 'bg-gray-400'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Pipeline</p>
                <h2 className="text-2xl font-semibold text-slate-900">Pedidos recentes</h2>
                <p className="text-sm text-gray-500">Últimas interações por parceiro.</p>
              </div>
              <Link to="/admin/pedidos" className="text-sm font-semibold text-ebenezer-green hover:underline">
                Ver todos
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <EmptyState icon={ShoppingCart} message="Ainda não há pedidos registrados." />
            ) : (
              <ul className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="rounded-2xl border border-gray-100 p-4 hover:border-emerald-100 transition">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.user?.name || 'Parceiro'}
                          <span className="ml-2 text-xs text-gray-500">{order.user?.company}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {currencyFormatter.format(order.totalAmount || 0)}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeForStatus(order.status)}`}>
                          {translateStatus(order.status)}
                          <span className="hidden sm:inline text-[10px] text-gray-500">{order.itemsCount} item(s)</span>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Mercado</p>
              <h2 className="text-xl font-semibold text-slate-900">Preços diários de metais</h2>
              <p className="text-sm text-gray-500">Sincronize com a bolsa de metais para recalcular automaticamente os produtos.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Platina (R$/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={metalPrices.platinum}
                    onChange={(e) => setMetalPrices({ ...metalPrices, platinum: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Paládio (R$/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={metalPrices.palladium}
                    onChange={(e) => setMetalPrices({ ...metalPrices, palladium: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Ródio (R$/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={metalPrices.rhodium}
                    onChange={(e) => setMetalPrices({ ...metalPrices, rhodium: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <button onClick={saveMetalPrices} disabled={savingPrices} className="btn-primary w-full md:w-auto">
                  {savingPrices ? 'Salvando...' : 'Salvar preços e recalcular'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Supply</p>
                <h2 className="text-xl font-semibold text-slate-900">Estoque crítico</h2>
                <p className="text-sm text-gray-500">Itens que precisam de reforço imediato.</p>
              </div>
              <Package className="w-5 h-5 text-ebenezer-green" />
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <EmptyState icon={Inbox} message="Nenhum alerta de estoque no momento." />
            ) : (
              <ul className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <li key={product._id || product.id || product.sku} className="rounded-2xl border border-gray-100 p-4 hover:border-emerald-100 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">SKU: {product.sku || 'N/A'} • Categoria: {product.category}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                        {product.stock} em estoque
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-panel">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Relacionamento</p>
                <h2 className="text-xl font-semibold text-slate-900">Mensagens recentes</h2>
                <p className="text-sm text-gray-500">Interações que aguardam retorno.</p>
              </div>
              <MessageSquare className="w-5 h-5 text-ebenezer-green" />
            </div>
            {stats.recentMessages.length === 0 ? (
              <EmptyState icon={MessageSquare} message="Nenhuma mensagem recebida nas últimas horas." />
            ) : (
              <ul className="space-y-4">
                {stats.recentMessages.map((message) => (
                  <li key={message.id} className="rounded-2xl border border-gray-100 p-4 hover:border-emerald-100 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {message.sender?.name || 'Parceiro'}
                          <span className="ml-2 text-xs text-gray-500">{message.sender?.company}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <p className="mt-3 text-sm text-gray-700 line-clamp-2">{message.content}</p>
                      </div>
                      <span className={`flex h-2 w-2 flex-shrink-0 rounded-full ${message.isRead ? 'bg-gray-300' : 'bg-rose-500'}`}></span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/admin/mensagens"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-ebenezer-green hover:border-ebenezer-green hover:bg-emerald-50 transition"
            >
              Gerenciar mensagens
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroMetric({ label, value, meta, trend, tone = 'neutral', icon: Icon }) {
  const toneClass = tone === 'positive'
    ? 'text-emerald-200'
    : tone === 'warning'
      ? 'text-amber-200'
      : 'text-sky-200';

  return (
    <div className="hero-metric">
      <div className="flex items-center justify-between gap-3">
        <div>
          <small>{meta}</small>
          <strong>{value}</strong>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
          <Icon className="w-5 h-5 text-white" />
        </span>
      </div>
      <div className="mt-2 text-sm text-white/80">
        {label}
      </div>
      <div className={`text-xs font-semibold tracking-wide mt-1 ${toneClass}`}>
        {trend}
      </div>
    </div>
  );
}

function InsightItem({ title, value, detail, icon: Icon }) {
  return (
    <li className="insight-item">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{title}</p>
          <p className="insight-item-value">{value}</p>
          <p className="text-sm text-gray-500">{detail}</p>
        </div>
      </div>
    </li>
  );
}

function StatCard({ title, value, icon: Icon, accent, link }) {
  const CardWrapper = link ? Link : 'div';
  const displayValue = typeof value === 'number' ? new Intl.NumberFormat('pt-BR').format(value) : value;

  return (
    <CardWrapper
      to={link}
      className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl ${link ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">{title}</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{displayValue}</p>
        </div>
        <span className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="w-6 h-6" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-0 transition group-hover:opacity-100"></div>
    </CardWrapper>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 py-10 text-center">
      <div className="rounded-full bg-white p-3 shadow-md">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

function badgeForStatus(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-rose-100 text-rose-600';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-600';
  }
}

function translateStatus(status) {
  switch (status) {
    case 'confirmed':
      return 'Confirmado';
    case 'rejected':
      return 'Rejeitado';
    case 'pending':
    default:
      return 'Pendente';
  }
}
