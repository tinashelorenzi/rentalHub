// src/pages/maintenance/MaintenanceDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from '../../config/constants';
import { formatCurrency } from '../../utils/formatters';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusIndicator from '../../components/common/StatusIndicator';
import MaintenanceTimeline from '../../components/maintenance/MaintenanceTimeline';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Textarea from '../../components/forms/Textarea';
import FileUpload from '../../components/forms/FileUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

interface MaintenanceComment {
  id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

const MaintenanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [comments, setComments] = useState<MaintenanceComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editEstimatedCost, setEditEstimatedCost] = useState('');
  const [editActualCost, setEditActualCost] = useState('');
  
  const fetchRequestData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const requestId = parseInt(id);
      
      // Fetch request details
      const requestData = await MaintenanceService.getMaintenanceRequest(requestId);
      setRequest(requestData);
      
      // Initialize edit form with current values
      setEditStatus(requestData.status);
      setEditPriority(requestData.priority);
      setEditAssignedTo(requestData.assigned_to_id ? requestData.assigned_to_id.toString() : '');
      setEditEstimatedCost(requestData.estimated_cost ? requestData.estimated_cost.toString() : '');
      setEditActualCost(requestData.actual_cost ? requestData.actual_cost.toString() : '');
      
      // Fetch comments
      const commentsData = await MaintenanceService.getComments(requestId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching maintenance request details:', err);
      setError('Failed to load maintenance request details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequestData();
  }, [id]);
  
  // Check if user has permission to view this request
  const hasPermission = request && user && (
    user.role === 'ADMIN' ||
    user.id === request.tenant_id || // Tenant who submitted the request
    (user.role === 'LANDLORD' && request.property_owner_id === user.id) || // Owner of the property
    (user.role === 'PROPERTY_MANAGER' && request.property_manager_id === user.id) || // Manager of the property
    request.assigned_to_id === user.id // Staff assigned to the request
  );
  
  // Check if user can update this request
  const canUpdateRequest = request && user && (
    user.role === 'ADMIN' ||
    (user.role === 'LANDLORD' && request.property_owner_id === user.id) ||
    (user.role === 'PROPERTY_MANAGER' && request.property_manager_id === user.id) ||
    request.assigned_to_id === user.id
  );
  
  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      
      const result = await MaintenanceService.addComment(parseInt(id), newComment);
      
      // Add new comment to the list
      setComments([
        ...comments,
        {
          id: result.comment_id,
          user_id: user?.id || 0,
          user_name: `${user?.first_name} ${user?.last_name}`,
          comment: newComment,
          created_at: result.created_at
        }
      ]);
      
      // Clear comment input
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleUploadImages = async () => {
    if (!id || images.length === 0) return;
    
    try {
      for (const image of images) {
        await MaintenanceService.uploadImage(parseInt(id), image);
      }
      
      // Clear images after upload
      setImages([]);
      
      // Refresh request data
      fetchRequestData();
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Failed to upload images. Please try again.');
    }
  };
  
  const handleUpdateRequest = async () => {
    if (!id || !request) return;
    
    try {
      setIsUpdatingRequest(true);
      setUpdateError(null);
      
      const requestData = {
        status: editStatus,
        priority: editPriority,
        assigned_to_id: editAssignedTo ? parseInt(editAssignedTo) : undefined,
        estimated_cost: editEstimatedCost ? parseFloat(editEstimatedCost) : undefined,
        actual_cost: editActualCost ? parseFloat(editActualCost) : undefined
      };
      
      await MaintenanceService.updateMaintenanceRequest(parseInt(id), requestData);
      
      // Update the request in state
      setRequest({
        ...request,
        ...requestData
      });
      
      // Exit edit mode
      setIsEditing(false);
      
      // Refresh request data (to get updated details)
      fetchRequestData();
    } catch (err) {
      console.error('Error updating maintenance request:', err);
      setUpdateError('Failed to update maintenance request. Please try again.');
    } finally {
      setIsUpdatingRequest(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !request) {
    return (
      <EmptyState
        title="Error loading maintenance request"
        description={error || "Maintenance request not found"}
        action={{
          label: "Back to Maintenance",
          onClick: () => navigate(ROUTES.MAINTENANCE),
        }}
      />
    );
  }
  
  if (!hasPermission) {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to view this maintenance request."
        action={{
          label: "Back to Dashboard",
          onClick: () => navigate(ROUTES.DASHBOARD),
        }}
      />
    );
  }
  
  // Prepare timeline items from comments
  const timelineItems = comments.map(comment => ({
    id: comment.id,
    date: comment.created_at,
    title: `Comment from ${comment.user_name}`,
    description: comment.comment,
    user: comment.user_name,
    type: 'comment' as const
  }));
  
  // Add status changes, assignment events, etc. to timeline
  // This would require additional data that we don't have in this implementation
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Maintenance Request #${request.id}`}
        subtitle={request.title}
        actions={
          canUpdateRequest && !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Request
            </Button>
          ) : null
        }
      />
      
      {/* Status and Priority Banner */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 flex items-center gap-4">
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <StatusIndicator type="maintenance" status={request.status} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Priority</div>
            <StatusIndicator type="priority" status={request.priority} />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">Property</div>
          <Link to={ROUTES.PROPERTY_DETAILS(request.property_id)} className="text-primary hover:underline">
            {request.property_name}
          </Link>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">Submitted By</div>
          <Link to={ROUTES.TENANT_DETAILS(request.tenant_id)} className="text-primary hover:underline">
            {request.tenant_name}
          </Link>
        </div>
      </div>
      
      {/* Request Details and Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-2">
          <Card title="Request Details">
            {isEditing ? (
              // Edit Form
              <div className="space-y-4">
                {updateError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {updateError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    id="status"
                    label="Status"
                    options={MAINTENANCE_STATUSES}
                    value={editStatus}
                    onChange={setEditStatus}
                  />
                  
                  <Select
                    id="priority"
                    label="Priority"
                    options={MAINTENANCE_PRIORITIES}
                    value={editPriority}
                    onChange={setEditPriority}
                  />
                  
                  <Input
                    id="assigned_to"
                    label="Assigned To (User ID)"
                    type="number"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                  />
                  
                  <Input
                    id="estimated_cost"
                    label="Estimated Cost ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editEstimatedCost}
                    onChange={(e) => setEditEstimatedCost(e.target.value)}
                  />
                  
                  <Input
                    id="actual_cost"
                    label="Actual Cost ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editActualCost}
                    onChange={(e) => setEditActualCost(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end space-x-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    isLoading={isUpdatingRequest}
                    onClick={handleUpdateRequest}
                  >
                    Update Request
                  </Button>
                </div>
              </div>
            ) : (
              // Display Details
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                    <p>{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                    <p>{new Date(request.updated_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h3>
                    <p>{request.assigned_to_name || 'Not assigned'}</p>
                  </div>
                  
                  {request.status === 'RESOLVED' && request.resolved_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Resolved On</h3>
                      <p>{new Date(request.resolved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {request.estimated_cost && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Cost</h3>
                      <p>{formatCurrency(request.estimated_cost)}</p>
                    </div>
                  )}
                  
                  {request.actual_cost && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Actual Cost</h3>
                      <p>{formatCurrency(request.actual_cost)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Timeline and Comments */}
        <div className="lg:col-span-1">
          <Card title="Activity Timeline">
            {timelineItems.length > 0 ? (
              <MaintenanceTimeline items={timelineItems} />
            ) : (
              <p className="text-gray-500 text-center py-4">No activity yet</p>
            )}
          </Card>
        </div>
      </div>
      
      {/* Add Comment */}
      <Card title="Add Comment">
        <div className="space-y-4">
          <Textarea
            id="comment"
            placeholder="Type your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              isLoading={isSubmittingComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Upload Images */}
      <Card title="Upload Images">
        <div className="space-y-4">
          <FileUpload
            accept="image/*"
            multiple
            onChange={setImages}
            hint="Upload images related to the maintenance request"
          />
          
          {images.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleUploadImages}>
                Upload {images.length} {images.length === 1 ? 'Image' : 'Images'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceDetails;