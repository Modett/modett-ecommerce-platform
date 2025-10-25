export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#2f4050] mb-8 text-center">
          Our Collections
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover our curated selection of timeless pieces, each crafted with care
          and designed to become a cherished part of your wardrobe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {/* Placeholder for product grid */}
          <div className="text-center text-gray-500 col-span-full py-12">
            Product catalog coming soon...
          </div>
        </div>
      </div>
    </div>
  )
}
