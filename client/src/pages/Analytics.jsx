import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalytics } from '../api/urls'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics(id)
        setData(res.data)
      } catch (err) {
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading analytics...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-red-500">{error}</p>
    </div>
  )

  const chartData = Object.entries(data.analytics.dailyClicks).map(([date, clicks]) => ({
    date,
    clicks
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">URL Shortener</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* URL Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">URL Details</h2>
          <p className="text-sm text-gray-500 mb-1">Original URL</p>
          <p className="text-gray-800 truncate mb-3">{data.url.longUrl}</p>
          <p className="text-sm text-gray-500 mb-1">Short URL</p>
          <a href={data.url.shortUrl} target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 hover:underline">{data.url.shortUrl}</a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-indigo-600">{data.analytics.totalClicks}</p>
            <p className="text-sm text-gray-500 mt-1">Total Clicks</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-lg font-bold text-gray-800">
              {data.analytics.lastVisited
                ? new Date(data.analytics.lastVisited).toLocaleDateString()
                : 'Never'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Last Visited</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-lg font-bold text-gray-800">
              {new Date(data.url.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Created On</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Clicks Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Visits */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Visits</h2>
          {data.analytics.recentVisits.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No visits yet</p>
          ) : (
            <div className="space-y-2">
              {data.analytics.recentVisits.map(visit => (
                <div key={visit.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-600">{new Date(visit.visitedAt).toLocaleString()}</span>
                  <span className="text-gray-400">{visit.deviceType || 'unknown'}</span>
                  <span className="text-gray-400">{visit.ipAddress || 'unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}