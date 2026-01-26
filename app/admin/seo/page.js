'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Globe,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle,
  FileText,
  Image,
  Link
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SEOManagementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seoSettings, setSeoSettings] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    page_path: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    robots: 'index, follow'
  })

  useEffect(() => {
    fetchSEOSettings()
  }, [])

  const fetchSEOSettings = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_path')

      if (error && error.code !== 'PGRST116') console.error('Error:', error)
      setSeoSettings(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      if (selectedPage) {
        await supabase
          .from('seo_settings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPage.id)
      } else {
        await supabase.from('seo_settings').insert([formData])
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setShowModal(false)
      fetchSEOSettings()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (page) => {
    setSelectedPage(page)
    setFormData({
      page_path: page.page_path,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      canonical_url: page.canonical_url || '',
      robots: page.robots || 'index, follow'
    })
    setShowModal(true)
  }

  const handleAddNew = () => {
    setSelectedPage(null)
    setFormData({
      page_path: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      canonical_url: '',
      robots: 'index, follow'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this SEO entry?')) return
    try {
      const supabase = createClient()
      await supabase.from('seo_settings').delete().eq('id', id)
      fetchSEOSettings()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getPageName = (path) => {
    if (path === '/') return 'Homepage'
    return path.replace(/\//g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SEO Management</h1>
                <p className="text-sm sm:text-base text-gray-500">Manage meta tags and SEO settings for all pages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {success && (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </span>
              )}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add Page
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* SEO Settings List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          </div>
        ) : seoSettings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No SEO settings configured</p>
          </div>
        ) : (
          <div className="space-y-4">
            {seoSettings.map((page) => (
              <div key={page.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{getPageName(page.page_path)}</h3>
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {page.page_path}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Title</p>
                          <p className="text-sm text-gray-600">{page.meta_title || 'Not set'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Description</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{page.meta_description || 'Not set'}</p>
                        </div>
                      </div>

                      {page.og_image && (
                        <div className="flex items-start gap-2">
                          <Image className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">OG Image</p>
                            <p className="text-sm text-gray-600 truncate">{page.og_image}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={page.page_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleEdit(page)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* SEO Score Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      page.meta_title?.length > 50 && page.meta_title?.length < 60
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Title: {page.meta_title?.length || 0}/60
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      page.meta_description?.length > 140 && page.meta_description?.length < 160
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Description: {page.meta_description?.length || 0}/160
                    </span>
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                      Robots: {page.robots || 'index, follow'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEO Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">SEO Best Practices</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Meta titles should be 50-60 characters for optimal display</li>
            <li>• Meta descriptions should be 140-160 characters</li>
            <li>• Include target keywords naturally in titles and descriptions</li>
            <li>• Use unique titles and descriptions for each page</li>
            <li>• OG images should be 1200x630 pixels for best social sharing</li>
          </ul>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPage ? 'Edit SEO Settings' : 'Add New Page'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Path *</label>
                <input
                  type="text"
                  value={formData.page_path}
                  onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                  placeholder="/cars"
                  disabled={!!selectedPage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                  <span className={`ml-2 text-xs ${
                    formData.meta_title.length > 50 && formData.meta_title.length < 60
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    ({formData.meta_title.length}/60)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                  <span className={`ml-2 text-xs ${
                    formData.meta_description.length > 140 && formData.meta_description.length < 160
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    ({formData.meta_description.length}/160)
                  </span>
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="cars, nigeria, buy cars"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Open Graph (Social Sharing)</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                    <input
                      type="text"
                      value={formData.og_title}
                      onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                    <textarea
                      value={formData.og_description}
                      onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                    <input
                      type="text"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      placeholder="https://justcars.ng/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Robots</label>
                    <select
                      value={formData.robots}
                      onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">No Index, Follow</option>
                      <option value="index, nofollow">Index, No Follow</option>
                      <option value="noindex, nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.page_path}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
