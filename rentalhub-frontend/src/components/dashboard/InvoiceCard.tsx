// src/components/dashboard/InvoiceCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusIndicator from '../common/StatusIndicator';
import { format, isAfter } from 'date-fns';
import { Invoice } from '../../types';

interface InvoiceCardProps {
  invoice: Invoice;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const dueDate = new Date(invoice.due_date);
  const isPastDue = isAfter(new Date(), dueDate) && invoice.status === 'PENDING';
  
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-500">Invoice #{invoice.id}</div>
          <h3 className="text-lg font-semibold">{invoice.property_name}</h3>
          <div className="text-sm text-gray-600">Tenant: {invoice.tenant_name}</div>
        </div>
        <StatusIndicator type="invoice" status={invoice.status} />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-700">
          <div className="text-sm">Due Date:</div>
          <div className={`font-medium ${isPastDue ? 'text-red-600' : ''}`}>
            {format(dueDate, 'MMM d, yyyy')}
            {isPastDue && ' (Past Due)'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700">Amount:</div>
          <div className="text-xl font-bold text-primary">${invoice.amount.toLocaleString()}</div>
        </div>
      </div>
      
      <Link 
        to={`/invoices/${invoice.id}`}
        className="block mt-2 text-center text-sm text-primary hover:text-primary-dark font-medium"
      >
        View Details →
      </Link>
    </Card>
  );
};

export default InvoiceCard;