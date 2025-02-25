# security/admin.py
from django.contrib import admin
from .models import LoginAttempt, ActivityLog, APIKey


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('username', 'ip_address', 'success', 'timestamp')
    list_filter = ('success', 'timestamp')
    search_fields = ('username', 'ip_address')
    date_hierarchy = 'timestamp'
    readonly_fields = ('username', 'ip_address', 'user_agent', 'success', 'timestamp')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'model_name', 'object_id', 'ip_address', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('user__username', 'model_name', 'description')
    date_hierarchy = 'timestamp'
    readonly_fields = ('user', 'activity_type', 'model_name', 'object_id', 'description', 'ip_address', 'timestamp')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'is_active', 'created_at', 'expires_at')
    list_filter = ('is_active', 'created_at', 'expires_at')
    search_fields = ('name', 'created_by__username')
    readonly_fields = ('created_at',)
    fields = ('name', 'key', 'is_active', 'created_by', 'expires_at', 'allowed_ips', 'created_at')