import { supabase } from '../config/supabase.js'

export const getCategories = async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({ success: true, data })
}

export const createCategory = async (req, res) => {
  const { name } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: "Category name is required" })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: name.trim() }])
    .select()
    .single()

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.status(201).json({ success: true, data })
}

export const updateCategory = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.json({ success: true, data })
}

export const deleteCategory = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ success: false, message: error.message })

  res.status(204).send()
}
