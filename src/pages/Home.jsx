import { Link } from 'react-router-dom'
import { ArrowRight, Laptop, Smartphone, Headphones, Watch } from 'lucide-react'

const categories = [
  { name: 'Laptops', icon: Laptop, color: 'bg-blue-500' },
  { name: 'Phones', icon: Smartphone, color: 'bg-green-500' },
  { name: 'Audio', icon: Headphones, color: 'bg-purple-500' },
  { name: 'Wearables', icon: Watch, color: 'bg-orange-500' },
]

const featured = [
  {
    id: 1,
    name: 'MacBook Pro 16" M4',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    category: 'Laptops',
  },
  {
    id: 2,
    name: 'iPhone 16 Pro Max',
    price: 1199,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    category: 'Phones',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM6',
    price: 399,
    image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    category: 'Audio',
  },
  {
    id: 4,
    name: 'Apple Watch Ultra 3',
    price: 799,
    image_url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72e9?w=400',
    category: 'Wearables',
  },
]

export default function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Next-Gen Electronics
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Discover the latest in technology with premium gadgets, laptops, phones, and accessories.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ name, icon: Icon, color }) => (
            <Link
              key={name}
              to={`/products?category=${name.toLowerCase()}`}
              className="group flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`p-3 ${color} rounded-lg text-white group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-900">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-500 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
