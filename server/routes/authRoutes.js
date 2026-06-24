import express from 'express'
import { register, login } from '../controllers/authController.js'

const router = express.Router()

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth Route Working'
  })
})

router.post('/register', register)
router.post('/login', login)

export default router