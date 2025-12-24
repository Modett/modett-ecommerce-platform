import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductImagesProps {
  images: ProductImage[];
}

export function ProductImages({ images }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom state when opening/closing
  useEffect(() => {
    if (isZoomed) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [isZoomed]);

  // If no images, show placeholder
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600'%3E%3Crect width='1200' height='1600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E",
            alt: "Product",
          },
        ];

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();

    const delta = e.deltaY > 0 ? 0.2 : -0.2;

    setZoomLevel((prev) => {
      const newZoom = Math.min(Math.max(prev + delta, 1), 5); // Clamp between 1x and 5x
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="w-full max-w-[904px]">
        {/* All Images Grid - 2 columns, all same size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {displayImages.slice(0, 6).map((image, index) => (
            <div
              key={index}
              className="relative w-full h-[607px] md:h-auto md:aspect-[444/565] bg-gray-100 overflow-hidden group cursor-pointer"
            >
              <div onClick={() => setSelectedImage(index)}>
                <Image
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>

              {/* Zoom Button Overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                  setIsZoomed(true);
                }}
                className="group/btn absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[#E5E0D6] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:border-[#D4C4A8]"
                aria-label="Zoom image"
              >
                <div className="w-8 h-8 bg-[#E5E0D6] rounded-full flex items-center justify-center group-hover/btn:bg-[#D4C4A8] transition-colors">
                  <Plus className="w-4 h-4 text-[#232D35]" strokeWidth={1.5} />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Fullscreen Zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-[#F5F5F0] flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-4">
            <button
              onClick={() => {
                setZoomLevel((prev) => Math.max(prev - 0.5, 1));
              }}
              className="group relative w-12 h-12 rounded-full border border-[#E5E0D6] flex items-center justify-center hover:border-[#D4C4A8] transition-colors"
              aria-label="Zoom Out"
            >
              <div className="w-8 h-8 bg-[#E5E0D6] rounded-full flex items-center justify-center group-hover:bg-[#D4C4A8] transition-colors">
                <Minus className="w-4 h-4 text-[#232D35]" strokeWidth={1.5} />
              </div>
            </button>
            <button
              onClick={() => {
                setZoomLevel((prev) => Math.min(prev + 0.5, 5));
              }}
              className="group relative w-12 h-12 rounded-full border border-[#E5E0D6] flex items-center justify-center hover:border-[#D4C4A8] transition-colors"
              aria-label="Zoom In"
            >
              <div className="w-8 h-8 bg-[#E5E0D6] rounded-full flex items-center justify-center group-hover:bg-[#D4C4A8] transition-colors">
                <Plus className="w-4 h-4 text-[#232D35]" strokeWidth={1.5} />
              </div>
            </button>
            <button
              onClick={() => setIsZoomed(false)}
              className="group relative w-12 h-12 rounded-full border border-[#E5E0D6] flex items-center justify-center hover:border-[#D4C4A8] transition-colors"
              aria-label="Close"
            >
              <div className="w-8 h-8 bg-[#E5E0D6] rounded-full flex items-center justify-center group-hover:bg-[#D4C4A8] transition-colors">
                <Minus
                  className="w-4 h-4 text-[#232D35] rotate-45"
                  strokeWidth={1.5}
                />
              </div>
            </button>
          </div>

          <div
            className={`relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out ${
              zoomLevel > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-out"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              // Only close if not dragging and not zoomed in (or clicking background)
              if (zoomLevel === 1 && !isDragging) setIsZoomed(false);
            }}
          >
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="relative w-full h-full"
            >
              <Image
                src={displayImages[selectedImage].url}
                alt={displayImages[selectedImage].alt || "Zoomed product image"}
                fill
                className="object-contain" // Keep aspect ratio
                quality={100}
                priority
                draggable={false} // Prevent native drag
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
