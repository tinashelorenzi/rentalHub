from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Property(models.Model):
    """Model for property listings"""
    class Category(models.TextChoices):
        RESIDENTIAL = 'RESIDENTIAL', _('Residential')
        COMMERCIAL = 'COMMERCIAL', _('Commercial')
        INDUSTRIAL = 'INDUSTRIAL', _('Industrial')
    
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('Available')
        RENTED = 'RENTED', _('Rented')
        MAINTENANCE = 'MAINTENANCE', _('Under Maintenance')
    
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='United States')
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.RESIDENTIAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    square_feet = models.PositiveIntegerField(default=0)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField(blank=True)
    amenities = models.TextField(blank=True)
    
    # Foreign keys
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_properties')
    property_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_properties'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.address})"


class PropertyImage(models.Model):
    """Images associated with a property"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/')
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.property.name}"


class PropertyDocument(models.Model):
    """Documents associated with a property (deeds, certificates, etc.)"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document = models.FileField(upload_to='property_documents/')
    description = models.TextField(blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} for {self.property.name}"


# tenant management models
class Lease(models.Model):
    """Lease agreements between tenants and properties"""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='leases')
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leases')
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    lease_document = models.FileField(upload_to='lease_documents/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Lease for {self.property.name} - {self.tenant.username}"