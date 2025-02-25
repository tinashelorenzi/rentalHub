from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Custom user model with role-based access"""
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrator')
        LANDLORD = 'LANDLORD', _('Landlord')
        PROPERTY_MANAGER = 'PROPERTY_MANAGER', _('Property Manager')
        TENANT = 'TENANT', _('Tenant')
    
    # Add related_name attributes to avoid clash with auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name='custom_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='custom_user_set',
        related_query_name='user',
    )
    
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TENANT)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    def is_landlord(self):
        return self.role == self.Role.LANDLORD
    
    def is_property_manager(self):
        return self.role == self.Role.PROPERTY_MANAGER
    
    def is_tenant(self):
        return self.role == self.Role.TENANT