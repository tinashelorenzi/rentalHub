// src/components/property/PropertyDetailsCard.tsx
import React from 'react';
import Card from '../common/Card';
import StatusIndicator from '../common/StatusIndicator';
import { Property } from '../../types';

interface PropertyDetailsCardProps {
  property: Property;
}

const PropertyDetailsCard: React.FC<PropertyDetailsCardProps> = ({ property }) => {
  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{property.name}</h3>
        <StatusIndicator type="property" status={property.status} />
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
        <p className="text-gray-800">{property.address}</p>
        <p className="text-gray-800">{property.city}, {property.state} {property.zip_code}</p>
        <p className="text-gray-800">{property.country}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
          <p className="text-gray-800">{property.category}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Bedrooms</h4>
          <p className="text-gray-800">{property.bedrooms}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Bathrooms</h4>
          <p className="text-gray-800">{property.bathrooms}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Square Feet</h4>
          <p className="text-gray-800">{property.square_feet}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Monthly Rent</h4>
          <p className="text-xl font-bold text-primary">${property.monthly_rent.toLocaleString()}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Deposit Amount</h4>
          <p className="text-gray-800 font-semibold">${property.deposit_amount.toLocaleString()}</p>
        </div>
      </div>
      
      {property.description && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
          <p className="text-gray-800 whitespace-pre-line">{property.description}</p>
        </div>
      )}
      
      {property.amenities && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Amenities</h4>
          <div className="text-gray-800 whitespace-pre-line">{property.amenities}</div>
        </div>
      )}
    </Card>
  );
};

export default PropertyDetailsCard;