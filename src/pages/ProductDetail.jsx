import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Star, Minus, Plus, ChevronRight, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore, useAuthStore } from '../lib/store'
import ReviewForm, { ReviewsList } from '../components/Reviews'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const [reviewKey, setReviewKey] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setProduct(data) })

    if (user) {
      supabase.from('wishlists').select('id').eq('product_id', id).eq('user_id', user.id).single()
        .then(({ data }) => setInWishlist(!!data))
    }
  }, [id, user])

  const toggleWishlist = async () => {
    if (!user) { alert('Please sign in to save to wishlist'); return }
    if (inWishlist) {
      await supabase.from('wishlists').delete().eq('product_id', id).eq('user_id', user.id)
      setInWishlist(false)
    } else {
      await supabase.from('wishlists').insert({ product_id: id, user_id: user.id })
      setInWishlist(true)
    }
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <a href="/" className="hover:text-gray-900">Home</a>
        <ChevronRight className="w-4 h-4" />
        <a href="/products" className="hover:text-gray-900">Products</a>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div>
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide mb-2">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>

          <p className="text-3xl font-bold text-gray-900 mb-6">${product.price}</p>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description || 'Premium quality electronic device with the latest technology.'}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 transition-colors">
                <Minus className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < quantity; i++) addItem(product) }}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Availability</span>
              <span className="text-green-600 font-semibold">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
            <div className="flex justify-between">
              <span>Free shipping</span>
              <span className="text-gray-900">On orders over $50</span>
            </div>
            <div className="flex justify-between">
              <span>Returns</span>
              <span className="text-gray-900">30-day guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-8">
        <ReviewsList productId={id} key={reviewKey} />
        <ReviewForm productId={id} onReviewAdded={() => setReviewKey(k => k + 1)} />
      </div>
    </div>
  )
}
