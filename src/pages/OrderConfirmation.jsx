import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package } from 'lucide-react'

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-12">
        <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed! 🎉</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Session ID: {sessionId || 'N/A'}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          You will receive an email confirmation shortly with your order details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            View My Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
