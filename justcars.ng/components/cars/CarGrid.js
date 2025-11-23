/**
 * Car Grid Component
 * Displays cars in responsive grid layout
 */

import CarCard from './CarCard'

export default function CarGrid({ cars }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No cars found matching your criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  )
}
