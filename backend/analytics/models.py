from django.db import models

from api.models import Property


class PropertyAnalytics(models.Model):
    """Aggregated analytics for properties"""
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='analytics')
    total_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentage
    average_tenant_stay = models.IntegerField(default=0)  # Days
    vacancy_days = models.IntegerField(default=0)
    maintenance_costs = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.property.name}"