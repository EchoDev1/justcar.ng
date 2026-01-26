'use client'

import { useState, useEffect } from 'react'
import {
  Sliders,
  Save,
  RefreshCw,
  DollarSign,
  Shield,
  Bell,
  Mail,
  Phone,
  Globe,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SETTING_CATEGORIES = [
  { id: 'fees', name: 'Fees & Pricing', icon: DollarSign },
  { id: 'thresholds', name: 'Thresholds', icon: Sliders },
  { id: 'limits', name: 'Limits', icon: Shield },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'moderation', name: 'Moderation', icon: AlertTriangle },
  { id: 'contact', name: 'Contact Info', icon: Mail },
  { id: 'system', name: 'System', icon: Globe }
]

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({})
  const [activeCategory, setActiveCategory] = useState('fees')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category')

      if (error && error.code !== 'PGRST116') {
        console.error('Error:', error)
      }

      const settingsMap = {}
      ;(data || []).forEach(s => {
        settingsMap[s.setting_key] = {
          ...s,
          value: typeof s.setting_value === 'string' ? s.setting_value.replace(/^"|"$/g, '') : s.setting_value
        }
      })
      setSettings(settingsMap)
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

      for (const [key, setting] of Object.entries(settings)) {
        if (setting.changed) {
          let valueToSave = setting.value
          if (setting.setting_type === 'string') {
            valueToSave = `"${setting.value}"`
          } else if (setting.setting_type === 'boolean') {
            valueToSave = setting.value === 'true' || setting.value === true
          } else if (setting.setting_type === 'number') {
            valueToSave = parseFloat(setting.value)
          }

          await supabase
            .from('system_settings')
            .update({
              setting_value: valueToSave,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key)
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchSettings()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value, changed: true }
    }))
  }

  const getCategorySettings = (category) => {
    return Object.entries(settings).filter(([_, s]) => s.category === category)
  }

  const renderSettingInput = (key, setting) => {
    switch (setting.setting_type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value === 'true' || setting.value === true}
              onChange={(e) => updateSetting(key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        )
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm sm:text-base text-gray-500">Configure platform settings and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {success && (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </span>
              )}
              <button
                onClick={fetchSettings}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
                {SETTING_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-blue-50 text-blue-700 lg:border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <cat.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm lg:text-base">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {SETTING_CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h2>

              <div className="space-y-6">
                {getCategorySettings(activeCategory).length === 0 ? (
                  <p className="text-gray-500">No settings in this category</p>
                ) : (
                  getCategorySettings(activeCategory).map(([key, setting]) => (
                    <div key={key} className="flex items-start justify-between gap-8">
                      <div className="flex-1">
                        <label className="block font-medium text-gray-900">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                      </div>
                      <div className="w-64">
                        {renderSettingInput(key, setting)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone */}
            {activeCategory === 'system' && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Maintenance Mode</p>
                      <p className="text-sm text-red-700">Disable the site for all users except admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenance_mode?.value === 'true' || settings.maintenance_mode?.value === true}
                        onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
