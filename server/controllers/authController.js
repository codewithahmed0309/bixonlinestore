import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase.js'
import generateToken from '../utils/generateToken.js'

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password } = req.body

    // check if user exists
    const { data: existingUser } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      })
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 10)

    // insert into DB (IMPORTANT: use "password" column)
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          email,
          password: password_hash
        }
      ])
      .select()
      .single()

    if (error) throw error

    const token = generateToken(data)

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: data.id,
        email: data.email
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle() // ✅ safer than single()

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!admin.password) {
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: missing password hash'
      })
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = generateToken(admin)

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}