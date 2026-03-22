import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'
//Regsiter
export const register = async (req, res) => {
    try{
        const {name, email, password} = req.body

        const existingUser = await prisma.user.findUnique({
            where: {email}
        })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use'})
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {name, email, passwordHash}
        })

        const token = jwt.sign(
            { userId : user.id},
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        )

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {id: user.id, name: user.name, email: user.email}
        })
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message })
    }
}
// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}