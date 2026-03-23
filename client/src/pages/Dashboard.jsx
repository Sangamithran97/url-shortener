import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUrl, getUserUrls, deleteUrl } from '../api/urls'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [urls, setUrls] = useState([])
  const [form, setForm] = useState({ longUrl: '', customAlias: '', expiresAt: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const res = await getUserUrls()
      setUrls(res.data.urls)
    } catch (err) {
      setError('Failed to fetch URLs')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await createUrl({
        longUrl: form.longUrl,
        customAlias: form.customAlias || undefined,
        expiresAt: form.expiresAt || undefined
      })
      setSuccess('Short URL created successfully!')
      setForm({ longUrl: '', customAlias: '', expiresAt: '' })
      fetchUrls()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create URL')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return
    try {
      await deleteUrl(id)
      setUrls(urls.filter(url => url.id !== id))
    } catch (err) {
      setError('Failed to delete URL')
    }
  }

  const handleCopy = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">URL Shortener</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hello, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Create URL Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Shorten a URL</h2>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="url"
              placeholder="Paste your long URL here..."
              value={form.longUrl}
              onChange={(e) => setForm({ ...form, longUrl: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Custom alias (optional)"
                value={form.customAlias}
                onChange={(e) => setForm({ ...form, customAlias: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Shorten URL'}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your URLs ({urls.length})</h2>

          {urls.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No URLs yet. Create your first short URL above!</p>
          ) : (
            <div className="space-y-4">
              {urls.map(url => (
                <div key={url.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate">{url.longUrl}</p>
                      {/* FIXED THE LINE BELOW: Added <a> tag */}
                      <a 
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        {url.shortUrl}
                      </a>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>Clicks: {url.clickCount}</span>
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        {url.expiresAt && <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleCopy(url.shortUrl, url.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition"
                      >
                        {copied === url.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => navigate(`/analytics/${url.id}`)}
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg transition"
                      >
                        Stats
                      </button>
                      <button
                        onClick={() => handleDelete(url.id)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}