from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from api.models import Property  # Import the Property model

# notification models

class Notification(models.Model):
    """Notification records for users"""
    class Type(models.TextChoices):
        PAYMENT_DUE = 'PAYMENT_DUE', _('Payment Due')
        PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', _('Payment Received')
        MAINTENANCE_UPDATE = 'MAINTENANCE_UPDATE', _('Maintenance Update')
        LEASE_UPDATE = 'LEASE_UPDATE', _('Lease Update')
        GENERAL = 'GENERAL', _('General')
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    # For linking notifications to specific entities
    content_type = models.CharField(max_length=50, blank=True)  # e.g., 'invoice', 'maintenance'
    object_id = models.PositiveIntegerField(null=True, blank=True)  # ID of the related object
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} for {self.user.username}"


# maintenance request models
class MaintenanceRequest(models.Model):
    """Maintenance tickets submitted by tenants"""
    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        EMERGENCY = 'EMERGENCY', _('Emergency')
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        RESOLVED = 'RESOLVED', _('Resolved')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='maintenance_requests')
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='maintenance_requests')
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Optional assigned maintenance staff
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_maintenance_requests'
    )
    
    # Cost tracking
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Maintenance Request #{self.id} - {self.property.name} - {self.title}"


class MaintenanceComment(models.Model):
    """Comments on maintenance requests"""
    maintenance_request = models.ForeignKey(MaintenanceRequest, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.user.username} on Request #{self.maintenance_request.id}"


class MaintenanceImage(models.Model):
    """Images attached to maintenance requests"""
    maintenance_request = models.ForeignKey(MaintenanceRequest, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='maintenance_images/')
    caption = models.CharField(max_length=255, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for Maintenance Request #{self.maintenance_request.id}"