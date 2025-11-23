/**
 * Car Detail Page
 * Detailed view of a single car
 */

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Gauge, Calendar, Fuel, Settings, Palette, CheckCircle, Phone, MessageCircle } from 'lucide-react'
import ImageGallery from '@/components/cars/ImageGallery'
import CarGrid from '@/components/cars/CarGrid'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatNaira, formatNumber, formatDate, generateWhatsAppLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getCar(id) {
  const supabase = await createClient()

  const { data: car, error } = await supabase
    .from('cars')
    .select(`
      *,
      dealers (*),
      car_images (*),
      car_videos (*)
    `)
    .eq('id', id)
    .single()

  if (error || !car) {
    return null
  }

  // Sort images by display_order
  if (car.car_images) {
    car.car_images.sort((a, b) => a.display_order - b.display_order)
  }

  return car
}

async function getSimilarCars(car) {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select(`
      *,
      dealers (name),
      car_images (image_url, is_primary)
    `)
    .eq('make', car.make)
    .neq('id', car.id)
    .limit(3)

  return cars || []
}

export default async function CarDetailPage({ params }) {
  const { id } = await params
  const car = await getCar(id)

  if (!car) {
    notFound()
  }

  const similarCars = await getSimilarCars(car)
  const whatsappLink = generateWhatsAppLink(car, car.dealers?.whatsapp)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/cars" className="text-blue-600 hover:text-blue-700">
            ← Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Title and Badges */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {car.is_verified && (
                  <Badge variant="verified" className="flex items-center gap-1">
                    <CheckCircle size={16} />
                    Verified
                  </Badge>
                )}
                {car.is_featured && (
                  <Badge variant="warning">Featured</Badge>
                )}
                <Badge variant="default">{car.condition}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-4xl font-bold text-blue-600">{formatNaira(car.price)}</p>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <ImageGallery images={car.car_images || []} />
            </div>

            {/* Video */}
            {car.car_videos && car.car_videos.length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Video</h2>
                <video controls className="w-full rounded-lg">
                  <source src={car.car_videos[0].video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold text-gray-900">{car.year}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gauge className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Mileage</p>
                    <p className="font-semibold text-gray-900">{formatNumber(car.mileage)} km</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Settings className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold text-gray-900">{car.transmission}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Fuel className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{car.fuel_type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Palette className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-semibold text-gray-900">{car.color}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{car.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Body Type</p>
                <p className="font-semibold text-gray-900">{car.body_type}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={18} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection Report */}
            {car.inspection_report && car.inspection_report.engine && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Inspection Report</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {car.inspection_report.engine && (
                    <div>
                      <p className="text-sm text-gray-600">Engine</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.engine}</p>
                    </div>
                  )}
                  {car.inspection_report.transmission && (
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.transmission}</p>
                    </div>
                  )}
                  {car.inspection_report.body && (
                    <div>
                      <p className="text-sm text-gray-600">Body</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.body}</p>
                    </div>
                  )}
                  {car.inspection_report.interior && (
                    <div>
                      <p className="text-sm text-gray-600">Interior</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.interior}</p>
                    </div>
                  )}
                  {car.inspection_report.ac_condition && (
                    <div>
                      <p className="text-sm text-gray-600">AC</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.ac_condition}</p>
                    </div>
                  )}
                  {car.inspection_report.documents && (
                    <div>
                      <p className="text-sm text-gray-600">Documents</p>
                      <p className="font-semibold text-gray-900">{car.inspection_report.documents}</p>
                    </div>
                  )}
                </div>
                {car.inspection_report.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Inspector Notes</p>
                    <p className="text-gray-700">{car.inspection_report.notes}</p>
                  </div>
                )}
                {car.inspection_report.inspector_name && (
                  <div className="mt-4 text-sm text-gray-600">
                    Inspected by {car.inspection_report.inspector_name}
                    {car.inspection_report.inspection_date && ` on ${formatDate(car.inspection_report.inspection_date)}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Dealer Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Dealer Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Dealer Information</h2>

                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-900 mb-1">{car.dealers?.name}</p>
                  {car.dealers?.is_verified && (
                    <Badge variant="success" size="sm" className="mb-3">Verified Dealer</Badge>
                  )}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{car.dealers?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{car.dealers?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="success" className="w-full flex items-center justify-center gap-2">
                      <MessageCircle size={20} />
                      WhatsApp Inquiry
                    </Button>
                  </a>
                  <a href={`tel:${car.dealers?.phone}`}>
                    <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                      <Phone size={20} />
                      Call Dealer
                    </Button>
                  </a>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Safety Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Inspect the car in person before purchase</li>
                  <li>• Verify all documents are authentic</li>
                  <li>• Take a test drive</li>
                  <li>• Meet in a safe public location</li>
                  <li>• Never send money without seeing the car</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Cars</h2>
            <CarGrid cars={similarCars} />
          </div>
        )}
      </div>
    </div>
  )
}
