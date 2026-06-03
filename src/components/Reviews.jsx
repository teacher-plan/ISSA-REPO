import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Star } from 'lucide-react'

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Please sign in to leave a review'); setLoading(false); return }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
    })
    if (error) {
      alert('Error submitting review: ' + error.message)
    } else {
      setComment('')
      setRating(5)
      if (onReviewAdded) onReviewAdded()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2">({rating}/5)</span>
      </div>
      <textarea
        placeholder="Share your thoughts about this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-3"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

export function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([])

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  useEffect(() => { loadReviews() }, [productId])

  if (reviews.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 text-lg">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
