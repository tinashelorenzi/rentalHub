// src/components/property/PropertyGallery.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyImage } from '../../types';

interface PropertyGalleryProps {
  images: PropertyImage[];
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center h-80">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const NavigationButton = ({ direction }: { direction: 'prev' | 'next' }) => (
    <button
      onClick={direction === 'prev' ? prevImage : nextImage}
      className="absolute top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-75 transition-all"
      style={{ [direction === 'prev' ? 'left' : 'right']: '10px' }}
    >
      {direction === 'prev' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      <div className="relative rounded-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentIndex}
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || 'Property image'}
              className="object-cover w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <>
            <NavigationButton direction="prev" />
            <NavigationButton direction="next" />
          </>
        )}

        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-75 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
              style={{ height: '60px', width: '80px' }}
            >
              <img
                src={image.url}
                alt={image.caption || `Property image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <img
                src={images[currentIndex].url}
                alt={images[currentIndex].caption || 'Property image'}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-gray-200 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 text-black hover:bg-gray-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    // src/components/property/PropertyGallery.tsx (continued)
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 text-black hover:bg-gray-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              {images[currentIndex].caption && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white py-2 px-4 rounded-md text-sm">
                  {images[currentIndex].caption}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyGallery;