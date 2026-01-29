
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Package, Settings, ShoppingCart, Heart, LogOut, ClipboardList } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

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

	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		function onScroll() {
			setScrolled(window.scrollY > 60);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<aside className="app-sidebar hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 z-40 border-r border-gray-700">
			{/* Header area collapses when the page is scrolled so nav items stick to the top */}
			<div className={`flex items-start justify-start px-4 bg-transparent text-white overflow-hidden transition-[max-height,padding] duration-500 ease-in-out ${scrolled ? 'max-h-0 pt-0' : 'max-h-20 pt-4'}`}>
				{/* Logo removed per request - space kept short so links are nearer the top */}
			</div>

			<nav className={`flex-1 overflow-y-auto transition-transform duration-500 ease-in-out px-2 pb-4 ${scrolled ? 'mt-10 pt-0 translate-y-0' : 'mt-20 pt-8 translate-y-0'}`}>
				{/* Link "Início" removido conforme solicitado */}

				{isAdmin ? (
					<>
						<Link to="/admin" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<LayoutDashboard className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Dashboard</span>
						</Link>

						<Link to="/admin/usuarios" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<User className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Usuários</span>
						</Link>

						<Link to="/admin/produtos" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<Package className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Produtos</span>
						</Link>

						<Link to="/admin" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<span className="ml-0 w-5 h-5 text-white/80 group-hover:text-white">🏢</span>
							<span className="ml-3">Admin</span>
						</Link>

						<Link to="/admin/config" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<Settings className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Configurações</span>
						</Link>
					</>
				) : (
					<>
						<Link to="/catalogo" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<Settings className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Catálogo</span>
						</Link>

						<Link to="/pedidos" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<ClipboardList className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Pedidos</span>
						</Link>

						<Link to="/favoritos" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<Heart className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Favoritos</span>
						</Link>

						<Link to="/carrinho" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<ShoppingCart className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Carrinho</span>
						</Link>

						<Link to="/perfil" className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330]">
							<User className="w-5 h-5 text-white/80 group-hover:text-white" />
							<span className="ml-3">Perfil</span>
						</Link>

						<button onClick={handleLogout} className="group flex items-center px-3 py-3 rounded-md text-white hover:bg-[#4e7330] w-full text-left">
							<LogOut className="w-5 h-5 text-white/80 group-hover:text-white" />
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

