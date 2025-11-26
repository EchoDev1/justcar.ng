/**
 * Admin Premium Verified Collection Page
 * Manage all premium verified cars
 */

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

async function getPremiumVerifiedCars() {
  const supabase = await createClient()

  const { data: cars, error } = await supabase
    .from('cars')
    .select(`
      *,
      dealers (name, is_verified),
      car_images (image_url, is_primary)
    `)
    .eq('is_premium_verified', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching premium verified cars:', error)
    return []
  }

  return cars || []
}

async function getStats() {
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from('cars')
    .select('id', { count: 'exact', head: true })
    .eq('is_premium_verified', true)

  return {
    totalPremiumCars: stats || 0
  }
}

export default async function PremiumVerifiedPage() {
  const cars = await getPremiumVerifiedCars()
  const stats = await getStats()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Premium Verified Collection</h1>
          <p className="text-gray-600 mt-2">
            Manage exclusive premium verified cars ({cars.length} total)
          </p>
        </div>
        <Link href="/admin/cars/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={20} />
            Add Premium Car
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded">
        <div className="flex">
          <Star className="text-purple-500 mr-3" size={24} />
          <div>
            <h3 className="text-sm font-medium text-purple-900">Premium Verified Collection</h3>
            <p className="text-sm text-purple-700 mt-1">
              These cars receive premium placement on the homepage and exclusive visibility to customers.
              Only verified dealers can add cars to this collection.
            </p>
          </div>
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Star className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-4">No premium verified cars yet</p>
                    <Link href="/admin/cars/new">
                      <Button variant="primary">Add First Premium Car</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                cars.map((car) => {
                  const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]

                  return (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {primaryImage && (
                            <img
                              src={primaryImage.image_url}
                              alt={`${car.make} ${car.model}`}
                              className="w-16 h-16 rounded object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {car.year} {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.condition} • {car.transmission}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{car.dealers?.name || 'N/A'}</div>
                        {car.dealers?.is_verified && (
                          <Badge variant="success" size="sm" className="mt-1">Verified Dealer</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{parseInt(car.price).toLocaleString('en-NG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Badge variant="primary" size="sm">Premium</Badge>
                          {car.is_verified && (
                            <Badge variant="success" size="sm">Verified</Badge>
                          )}
                          {car.is_featured && (
                            <Badge variant="warning" size="sm">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/cars/${car.id}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/admin/cars/${car.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
