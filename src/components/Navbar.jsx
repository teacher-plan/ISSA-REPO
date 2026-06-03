import { Link } from 'react-router-dom'
import { ShoppingCart, User, Package, Heart, LayoutDashboard } from 'lucide-react'
import { useCartStore, useAuthStore } from '../lib/store'

export default function Navbar() {
  const totalItems = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0))
  const user = useAuthStore((s) => s.user)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Package className="w-6 h-6 text-indigo-600" />
            TechStore
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-gray-900 transition-colors" title="My Orders">
                  <Package className="w-5 h-5" />
                </Link>
                {user.role === 'admin' && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
              </>
            )}
            {user ? (
              <span className="text-sm text-gray-600">{user.email}</span>
            ) : (
              <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Sign In
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
