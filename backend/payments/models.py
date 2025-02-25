from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

from api.models import Property, Lease


class Invoice(models.Model):
    """Invoices for rent and other charges"""
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PAID = 'PAID', _('Paid')
        OVERDUE = 'OVERDUE', _('Overdue')
        CANCELLED = 'CANCELLED', _('Cancelled')
    
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='invoices')
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Invoice #{self.id} - {self.tenant.username} - {self.amount}"
    
    def is_overdue(self):
        from django.utils import timezone
        return self.status == self.Status.PENDING and self.due_date < timezone.now().date()


class Payment(models.Model):
    """Payments made against invoices"""
    class Method(models.TextChoices):
        STRIPE = 'STRIPE', _('Stripe')
        PAYPAL = 'PAYPAL', _('PayPal')
        BANK_TRANSFER = 'BANK_TRANSFER', _('Bank Transfer')
        CASH = 'CASH', _('Cash')
        CHECK = 'CHECK', _('Check')
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateTimeField()
    payment_method = models.CharField(max_length=20, choices=Method.choices)
    transaction_id = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment #{self.id} for Invoice #{self.invoice.id} - {self.amount}"