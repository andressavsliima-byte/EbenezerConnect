
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Package, Settings, ShoppingCart, Heart, LogOut, ClipboardList } from 'lucide-react';
import { useMemo } from 'react';

export default function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const userStr = localStorage.getItem('user');
	const user = userStr ? JSON.parse(userStr) : null;
	const isAdmin = user?.role === 'admin';
	const isCatalog = location?.pathname?.startsWith('/catalogo');

	const handleLogout = () => {
		try {
			const uStr = localStorage.getItem('user');
			if (uStr) {
				const u = JSON.parse(uStr);
				localStorage.setItem('lastEmail', u?.email || '');
			}
		} catch {}
		localStorage.removeItem('token');
		navigate('/');
	};

	const partnerLinks = useMemo(() => [
		{ to: '/catalogo', label: 'Catálogo', icon: null },
		{ to: '/pedidos', label: 'Pedidos', icon: OrdersIconPlaceholder() },
		{ to: '/favoritos', label: 'Favoritos', icon: Heart },
		{ to: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
		{ to: '/perfil', label: 'Perfil', icon: User },
	], []);

	const linkBase = 'group flex items-center px-3 py-3 rounded-md text-[#2f5112] hover:bg-[#4e7330] hover:text-white';
	const iconBase = 'w-5 h-5 text-[#2f5112]/80 group-hover:text-white';

	return (
		<aside className="app-sidebar hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-60 z-40 border-r border-gray-700 bg-[#d7e29b]">
			{/* Mantém o menu fixo acompanhando o scroll sem encolher e fora do cabeçalho verde */}
			<div className="flex items-start justify-start px-4 pt-2 bg-transparent text-white max-h-16">
				{/* Logo removido per request */}
			</div>

			<nav className="flex-1 overflow-y-auto px-2 pb-4 pt-4">
				{/* Link "Início" removido conforme solicitado */}

				{isAdmin ? (
					<>
						<Link to="/admin" className={linkBase}>
							<LayoutDashboard className={iconBase} />
							<span className="ml-3">Dashboard</span>
						</Link>

						<Link to="/admin/usuarios" className={linkBase}>
							<User className={iconBase} />
							<span className="ml-3">Usuários</span>
						</Link>

						<Link to="/admin/produtos" className={linkBase}>
							<Package className={iconBase} />
							<span className="ml-3">Produtos</span>
						</Link>

						<button onClick={handleLogout} className={`${linkBase} w-full text-left`}>
							<LogOut className={iconBase} />
							<span className="ml-3">Sair</span>
						</button>
					</>
				) : (
					<>
						<Link to="/catalogo" className={linkBase}>
							<Settings className={iconBase} />
							<span className="ml-3">Catálogo</span>
						</Link>

						<Link to="/pedidos" className={linkBase}>
							<ClipboardList className={iconBase} />
							<span className="ml-3">Pedidos</span>
						</Link>

						<Link to="/favoritos" className={linkBase}>
							<Heart className={iconBase} />
							<span className="ml-3">Favoritos</span>
						</Link>

						<Link to="/carrinho" className={linkBase}>
							<ShoppingCart className={iconBase} />
							<span className="ml-3">Carrinho</span>
						</Link>

						<Link to="/perfil" className={linkBase}>
							<User className={iconBase} />
							<span className="ml-3">Perfil</span>
						</Link>

						<button onClick={handleLogout} className={`${linkBase} w-full text-left`}>
							<LogOut className={iconBase} />
							<span className="ml-3">Sair</span>
						</button>
					</>
				)}
			</nav>
		</aside>
	);
}

function OrdersIconPlaceholder() {
	// simple wrapper if a dedicated icon is needed later
	return null;
}

