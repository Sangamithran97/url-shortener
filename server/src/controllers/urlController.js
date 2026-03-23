import prisma from '../utils/prisma.js'
import { nanoid } from 'nanoid'

// Create short URL
export const createUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body

    // Validate URL
    try {
      new URL(longUrl)
    } catch {
      return res.status(400).json({ message: 'Invalid URL' })
    }

    // Check if custom alias is already taken
    if (customAlias) {
      const existing = await prisma.url.findUnique({
        where: { customAlias }
      })
      if (existing) {
        return res.status(400).json({ message: 'Custom alias already taken' })
      }
    }

    // Generate short code
    const shortCode = customAlias || nanoid(6)

    // Create the URL
    const url = await prisma.url.create({
      data: {
        longUrl,
        shortCode,
        customAlias: customAlias || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: req.userId
      }
    })

    res.status(201).json({
      message: 'Short URL created successfully',
      url: {
        id: url.id,
        longUrl: url.longUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all URLs for a user
export const getUserUrls = async (req, res) => {
  try {
    const urls = await prisma.url.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })

    const frontendBase = process.env.FRONTEND_URL || 'https://url-short-webapp.vercel.app';
    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      shortUrl: `${frontendBase}/${url.shortCode}`
    }))

    res.json({ urls: urlsWithShortUrl })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete a URL
export const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params

    // Check if URL belongs to the user
    const url = await prisma.url.findUnique({
      where: { id }
    })

    if (!url) {
      return res.status(404).json({ message: 'URL not found' })
    }

    if (url.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await prisma.url.delete({ where: { id } })

    res.json({ message: 'URL deleted successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Redirect to long URL
export const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params

    const url = await prisma.url.findUnique({
      where: { shortCode }
    })

    if (!url || !url.isActive) {
      return res.status(404).json({ message: 'URL not found' })
    }

    // Check if URL is expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: 'URL has expired' })
    }

    // Log analytics
    await prisma.analytics.create({
      data: {
        urlId: url.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    })

    // Increment click count
    await prisma.url.update({
      where: { id: url.id },
      data: { clickCount: { increment: 1 } }
    })

    // Redirect
    res.redirect(url.longUrl)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}