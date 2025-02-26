// src/components/dashboard/PropertyCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusIndicator from '../common/StatusIndicator';
import Button from '../common/Button';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Find primary image or use default
  const primaryImage = property.images?.find(img => img.is_primary)?.url || 
                      (property.images && property.images.length > 0 ? property.images[0].url : null);
  
  return (
    <Card className="h-full overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
            </svg>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <StatusIndicator type="property" status={property.status} />
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-neutral-dark">{property.name}</h3>
        
        <div className="text-sm text-gray-500 mb-3">
          <div>{property.address}</div>
          <div>{property.city}, {property.state} {property.zip_code}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          <div className="text-center">
            <div className="font-semibold text-neutral-dark">{property.bedrooms}</div>
            <div className="text-gray-500">Beds</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-neutral-dark">{property.bathrooms}</div>
            <div className="text-gray-500">Baths</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-neutral-dark">{property.square_feet}</div>
            <div className="text-gray-500">Sq Ft</div>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="mb-3 font-bold text-lg text-primary">
            ${property.monthly_rent.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/month</span>
          </div>
          
          <Link to={`/properties/${property.id}`}>
            <Button variant="primary" className="w-full">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;