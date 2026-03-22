import prisma from '../utils/prisma.js'

export const getUrlAnalytics = async (req, res) => {
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

    // Get all analytics for this URL
    const visits = await prisma.analytics.findMany({
      where: { urlId: id },
      orderBy: { visitedAt: 'desc' },
      take: 20
    })

    // Get daily clicks for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentVisits = await prisma.analytics.findMany({
      where: {
        urlId: id,
        visitedAt: { gte: sevenDaysAgo }
      },
      orderBy: { visitedAt: 'asc' }
    })

    // Group visits by date
    const dailyClicks = {}
    recentVisits.forEach(visit => {
      const date = visit.visitedAt.toISOString().split('T')[0]
      dailyClicks[date] = (dailyClicks[date] || 0) + 1
    })

    res.json({
      url: {
        id: url.id,
        longUrl: url.longUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt
      },
      analytics: {
        totalClicks: url.clickCount,
        lastVisited: visits[0]?.visitedAt || null,
        recentVisits: visits,
        dailyClicks
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}