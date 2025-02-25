from django.contrib import admin
from .models import Property, PropertyImage, PropertyDocument, Lease


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


class PropertyDocumentInline(admin.TabularInline):
    model = PropertyDocument
    extra = 1


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'city', 'category', 'status', 'bedrooms', 'monthly_rent', 'owner')
    list_filter = ('status', 'category', 'city', 'state')
    search_fields = ('name', 'address', 'description')
    inlines = [PropertyImageInline, PropertyDocumentInline]


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ('property', 'tenant', 'start_date', 'end_date', 'rent_amount', 'is_active')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('property__name', 'tenant__username', 'tenant__email')
    date_hierarchy = 'start_date'