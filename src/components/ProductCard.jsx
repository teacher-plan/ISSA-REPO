import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '../lib/store'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating || '4.5'}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${product.original_price}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
