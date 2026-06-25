console.log("SUPABASE URL:", process.env.SUPABASE_URL);
console.log("🔥 SERVER BOOTING...");
console.log("PORT:", process.env.PORT);
console.log("SUPABASE:", process.env.SUPABASE_URL);
import './config/env.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
const app = express()

app.set('etag', false)

// middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// routes
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)

// test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mubarak Laptops API Running'
  })
})

// DB test route
import { supabase } from './config/supabase.js'

app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')

    res.json({ success: true, data, error })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// start server
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url)
  next()
})
