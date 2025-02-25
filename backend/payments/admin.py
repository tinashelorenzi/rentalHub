from django.contrib import admin
from .models import Invoice, Payment


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'property', 'amount', 'due_date', 'status')
    list_filter = ('status', 'due_date')
    search_fields = ('tenant__username', 'property__name', 'description')
    date_hierarchy = 'due_date'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'amount', 'payment_date', 'payment_method')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('invoice__tenant__username', 'transaction_id', 'notes')
    date_hierarchy = 'payment_date'
