from django.contrib import admin
from analytics.models import PropertyAnalytics


@admin.register(PropertyAnalytics)
class PropertyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('property', 'total_income', 'total_expenses', 'occupancy_rate', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('property__name',)
    date_hierarchy = 'last_updated'