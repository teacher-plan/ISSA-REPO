import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const app = express()
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use('/api/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, userId, shippingAddress } = req.body

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cart`,
      metadata: { userId: userId || 'guest' },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent', session.payment_intent)
      .single()

    if (!existing) {
      const { error } = await supabase.from('orders').insert({
        user_id: session.metadata.userId !== 'guest' ? session.metadata.userId : null,
        items: session.metadata.items ? JSON.parse(session.metadata.items) : [],
        total: session.amount_total / 100,
        status: 'confirmed',
        shipping_address: {},
        payment_intent: session.payment_intent,
      })

      if (error) console.error('Order insert error:', error)
    }
  }

  res.json({ received: true })
})

app.get('/api/orders', async (req, res) => {
  const { userId, status } = req.query
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/orders/stats', async (req, res) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, status, created_at')

  if (error) return res.status(500).json({ error: error.message })

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total) : 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

  res.json({ totalRevenue, totalOrders, pendingOrders, confirmedOrders, cancelledOrders })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
