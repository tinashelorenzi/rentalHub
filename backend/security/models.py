# security/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class LoginAttempt(models.Model):
    """Track login attempts for security monitoring"""
    username = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = _('Login Attempt')
        verbose_name_plural = _('Login Attempts')
    
    def __str__(self):
        return f"{self.username} - {'Success' if self.success else 'Failed'} - {self.timestamp}"


class ActivityLog(models.Model):
    """Log user activities for audit purposes"""
    class ActivityType(models.TextChoices):
        CREATE = 'CREATE', _('Create')
        UPDATE = 'UPDATE', _('Update')
        DELETE = 'DELETE', _('Delete')
        VIEW = 'VIEW', _('View')
        LOGIN = 'LOGIN', _('Login')
        LOGOUT = 'LOGOUT', _('Logout')
        OTHER = 'OTHER', _('Other')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    activity_type = models.CharField(max_length=10, choices=ActivityType.choices)
    model_name = models.CharField(max_length=100, blank=True)  # Which model was affected
    object_id = models.PositiveIntegerField(null=True, blank=True)  # ID of the affected object
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = _('Activity Log')
        verbose_name_plural = _('Activity Logs')
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.activity_type} - {self.timestamp}"


class APIKey(models.Model):
    """API Keys for external service integration"""
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_api_keys'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    allowed_ips = models.TextField(blank=True, help_text=_('Comma-separated list of IP addresses allowed to use this key'))
    
    class Meta:
        verbose_name = _('API Key')
        verbose_name_plural = _('API Keys')
    
    def __str__(self):
        return self.name