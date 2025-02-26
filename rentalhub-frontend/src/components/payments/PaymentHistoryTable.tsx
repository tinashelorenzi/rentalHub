// src/components/payments/PaymentHistoryTable.tsx
import React from 'react';
import { format } from 'date-fns';
import { Payment } from '../../types';
import StatusIndicator from '../common/StatusIndicator';

interface PaymentHistoryTableProps {
  payments: Payment[];
  onViewDetails?: (payment: Payment) => void;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  onViewDetails,
}) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-gray-500">No payment history available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Property
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Method
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Invoice Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            {onViewDetails && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(payment.payment_date), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {payment.property_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                ${payment.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.payment_method.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${payment.invoice_amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <StatusIndicator
                  type="invoice"
                  status={payment.amount >= payment.invoice_amount ? 'PAID' : 'PENDING'}
                />
              </td>
              {onViewDetails && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(payment)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Details
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistoryTable;