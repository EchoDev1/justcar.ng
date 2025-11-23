'use client'

import CarCategoryCard from './CarCategoryCard'

export default function CarCategoriesGrid() {
  const categories = [
    {
      id: 1,
      category: 'SUVs & Crossovers',
      count: 247,
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      href: '/cars?category=suv'
    },
    {
      id: 2,
      category: 'Luxury Sedans',
      count: 183,
      imageUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
      href: '/cars?category=sedan'
    },
    {
      id: 3,
      category: 'Sports Cars',
      count: 92,
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      href: '/cars?category=sports'
    },
    {
      id: 4,
      category: 'Electric Vehicles',
      count: 68,
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
      href: '/cars?category=electric'
    },
    {
      id: 5,
      category: 'Pickup Trucks',
      count: 134,
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
      href: '/cars?category=truck'
    },
    {
      id: 6,
      category: 'Compact & Economy',
      count: 215,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      href: '/cars?category=compact'
    }
  ]

  return (
    <section className="car-categories-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="category-section-header">
          <h2 className="category-section-title">
            Browse by <span className="gradient-text-animated">Category</span>
          </h2>
          <p className="category-section-subtitle">
            Find your perfect car from our extensive collection across all categories
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="category-cards-grid">
          {categories.map((cat) => (
            <CarCategoryCard
              key={cat.id}
              category={cat.category}
              count={cat.count}
              imageUrl={cat.imageUrl}
              href={cat.href}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
