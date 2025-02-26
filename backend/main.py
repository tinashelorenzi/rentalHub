# main.py
import os
import sys
import django
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from fastapi import FastAPI, HTTPException, Depends, Query, Path, Body, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
import jwt
from passlib.context import CryptContext
import uvicorn

# Set up Django integration
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentalhub.settings")
django.setup()

# Import Django models
from django.contrib.auth import authenticate
from users.models import User
from api.models import (
    Property, PropertyImage, PropertyDocument, Lease
)

from notifications.models import (MaintenanceRequest,MaintenanceImage,MaintenanceComment)
from payments.models import Invoice, Payment
from notifications.models import Notification
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.core.files.base import ContentFile

# Create FastAPI app
app = FastAPI(
    title="RentalHub API",
    description="API for the RentalHub property management system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"  # Replace with your actual secret key from settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Pydantic models for requests and responses
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str
    phone_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    role: str
    phone_number: Optional[str] = None
    profile_image: Optional[str] = None

class PropertyBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "United States"
    category: str
    bedrooms: int
    bathrooms: int
    square_feet: int
    monthly_rent: Decimal
    deposit_amount: Decimal
    description: Optional[str] = None
    amenities: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyResponse(PropertyBase):
    id: int
    status: str
    owner_id: int
    property_manager_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    images: Optional[List[Dict[str, Any]]] = None

class LeaseBase(BaseModel):
    property_id: int
    tenant_id: int
    start_date: date
    end_date: date
    rent_amount: Decimal
    deposit_amount: Decimal
    is_active: bool = True

class LeaseCreate(LeaseBase):
    pass

class LeaseResponse(LeaseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    property_name: str
    tenant_name: str

class MaintenanceRequestBase(BaseModel):
    property_id: int
    title: str
    description: str
    priority: str

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    tenant_id: int
    tenant_name: str
    status: str
    assigned_to_id: Optional[int] = None
    assigned_to_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    estimated_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None

class InvoiceBase(BaseModel):
    tenant_id: int
    property_id: int
    lease_id: int
    amount: Decimal
    description: str
    due_date: date

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    tenant_name: str
    property_name: str

class PaymentBase(BaseModel):
    invoice_id: int
    amount: Decimal
    payment_method: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    payment_date: datetime
    created_at: datetime
    invoice_amount: Decimal
    tenant_id: int
    tenant_name: str
    property_id: int
    property_name: str

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + ACCESS_TOKEN_EXPIRE_MINUTES
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = User.objects.filter(username=token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Helper functions to convert Django model instances to Pydantic models
def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number,
        profile_image=user.profile_image.url if user.profile_image else None
    )

def property_to_response(prop: Property) -> PropertyResponse:
    images = []
    for img in prop.images.all():
        images.append({
            "id": img.id,
            "url": img.image.url,
            "caption": img.caption,
            "is_primary": img.is_primary
        })
    
    return PropertyResponse(
        id=prop.id,
        name=prop.name,
        address=prop.address,
        city=prop.city,
        state=prop.state,
        zip_code=prop.zip_code,
        country=prop.country,
        category=prop.category,
        status=prop.status,
        bedrooms=prop.bedrooms,
        bathrooms=prop.bathrooms,
        square_feet=prop.square_feet,
        monthly_rent=prop.monthly_rent,
        deposit_amount=prop.deposit_amount,
        description=prop.description,
        amenities=prop.amenities,
        owner_id=prop.owner_id,
        property_manager_id=prop.property_manager_id,
        created_at=prop.created_at,
        updated_at=prop.updated_at,
        images=images
    )

def lease_to_response(lease: Lease) -> LeaseResponse:
    return LeaseResponse(
        id=lease.id,
        property_id=lease.property_id,
        tenant_id=lease.tenant_id,
        start_date=lease.start_date,
        end_date=lease.end_date,
        rent_amount=lease.rent_amount,
        deposit_amount=lease.deposit_amount,
        is_active=lease.is_active,
        created_at=lease.created_at,
        updated_at=lease.updated_at,
        property_name=lease.property.name,
        tenant_name=f"{lease.tenant.first_name} {lease.tenant.last_name}"
    )

def maintenance_to_response(req: MaintenanceRequest) -> MaintenanceRequestResponse:
    assigned_to_name = None
    if req.assigned_to:
        assigned_to_name = f"{req.assigned_to.first_name} {req.assigned_to.last_name}"
    
    return MaintenanceRequestResponse(
        id=req.id,
        property_id=req.property_id,
        tenant_id=req.tenant_id,
        tenant_name=f"{req.tenant.first_name} {req.tenant.last_name}",
        title=req.title,
        description=req.description,
        priority=req.priority,
        status=req.status,
        assigned_to_id=req.assigned_to_id,
        assigned_to_name=assigned_to_name,
        created_at=req.created_at,
        updated_at=req.updated_at,
        resolved_at=req.resolved_at,
        estimated_cost=req.estimated_cost,
        actual_cost=req.actual_cost
    )

def invoice_to_response(invoice: Invoice) -> InvoiceResponse:
    return InvoiceResponse(
        id=invoice.id,
        tenant_id=invoice.tenant_id,
        property_id=invoice.property_id,
        lease_id=invoice.lease_id,
        amount=invoice.amount,
        description=invoice.description,
        due_date=invoice.due_date,
        status=invoice.status,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        tenant_name=f"{invoice.tenant.first_name} {invoice.tenant.last_name}",
        property_name=invoice.property.name
    )

def payment_to_response(payment: Payment) -> PaymentResponse:
    return PaymentResponse(
        id=payment.id,
        invoice_id=payment.invoice_id,
        amount=payment.amount,
        payment_date=payment.payment_date,
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        notes=payment.notes,
        created_at=payment.created_at,
        invoice_amount=payment.invoice.amount,
        tenant_id=payment.invoice.tenant_id,
        tenant_name=f"{payment.invoice.tenant.first_name} {payment.invoice.tenant.last_name}",
        property_id=payment.invoice.property_id,
        property_name=payment.invoice.property.name
    )

# API endpoints
@app.get("/status")
async def get_status():
	return {"status": "ok"}

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate(username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }

@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    db_user = User.objects.filter(username=user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = User.objects.filter(email=user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number
    )
    db_user.set_password(user.password)
    db_user.save()
    
    return user_to_response(db_user)

@app.get("/users/me/", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)

@app.put("/users/me/", response_model=UserResponse)
async def update_user(
    user_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    # Fields that can be updated
    updatable_fields = ["first_name", "last_name", "phone_number", "email"]
    
    # Update fields
    for field in updatable_fields:
        if field in user_data:
            setattr(current_user, field, user_data[field])
    
    # Update password if provided
    if "password" in user_data and user_data["password"]:
        current_user.set_password(user_data["password"])
    
    current_user.save()
    return user_to_response(current_user)

@app.post("/users/me/profile-image/")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    content = await file.read()
    current_user.profile_image.save(
        file.filename,
        ContentFile(content)
    )
    current_user.save()
    
    return {"message": "Profile image uploaded successfully"}

# Property endpoints
@app.get("/properties/", response_model=List[PropertyResponse])
async def list_properties(
    status: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_bedrooms: Optional[int] = None,
    max_rent: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q()
    
    # Filter based on user role
    if current_user.is_tenant():
        # Tenants see available properties and their rented ones
        query &= Q(status=Property.Status.AVAILABLE) | Q(leases__tenant=current_user, leases__is_active=True)
    elif current_user.is_property_manager():
        # Property managers see properties they manage
        query &= Q(property_manager=current_user)
    elif current_user.is_landlord():
        # Landlords see properties they own
        query &= Q(owner=current_user)
    # Admins see all
    
    # Apply filters
    if status:
        query &= Q(status=status)
    if category:
        query &= Q(category=category)
    if city:
        query &= Q(city__icontains=city)
    if min_bedrooms:
        query &= Q(bedrooms__gte=min_bedrooms)
    if max_rent:
        query &= Q(monthly_rent__lte=max_rent)
    
    properties = Property.objects.filter(query).distinct()
    return [property_to_response(prop) for prop in properties]

@app.post("/properties/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if not (current_user.is_admin() or current_user.is_landlord()):
        raise HTTPException(status_code=403, detail="Not authorized to create properties")
    
    # Create property
    new_property = Property(
        name=property_data.name,
        address=property_data.address,
        city=property_data.city,
        state=property_data.state,
        zip_code=property_data.zip_code,
        country=property_data.country,
        category=property_data.category,
        status=Property.Status.AVAILABLE,
        bedrooms=property_data.bedrooms,
        bathrooms=property_data.bathrooms,
        square_feet=property_data.square_feet,
        monthly_rent=property_data.monthly_rent,
        deposit_amount=property_data.deposit_amount,
        description=property_data.description,
        amenities=property_data.amenities,
        owner=current_user
    )
    new_property.save()
    
    return property_to_response(new_property)

@app.get("/properties/{property_id}/", response_model=PropertyResponse)
async def get_property(
    property_id: int = Path(...),
    current_user: User = Depends(get_current_user)
):
    property = Property.objects.filter(id=property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions based on role
    if current_user.is_tenant():
        # Tenants can only see available properties or ones they're renting
        is_tenant_property = Lease.objects.filter(
            property=property, 
            tenant=current_user, 
            is_active=True
        ).exists()
        
        if not (property.status == Property.Status.AVAILABLE or is_tenant_property):
            raise HTTPException(status_code=403, detail="Not authorized to view this property")
    
    elif current_user.is_property_manager() and property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this property")
    
    elif current_user.is_landlord() and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this property")
    
    return property_to_response(property)

@app.put("/properties/{property_id}/", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    # Get property
    property = Property.objects.filter(id=property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user.is_landlord() and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this property")
    
    if current_user.is_property_manager() and property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this property")
    
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Tenants cannot update properties")
    
    # Fields that can be updated
    updatable_fields = [
        "name", "address", "city", "state", "zip_code", "country",
        "category", "status", "bedrooms", "bathrooms", "square_feet",
        "monthly_rent", "deposit_amount", "description", "amenities"
    ]
    
    # Update fields
    for field in updatable_fields:
        if field in property_data:
            setattr(property, field, property_data[field])
    
    # Update property_manager if provided
    if "property_manager_id" in property_data and current_user.is_landlord():
        if property_data["property_manager_id"]:
            manager = User.objects.filter(
                id=property_data["property_manager_id"], 
                role=User.Role.PROPERTY_MANAGER
            ).first()
            
            if not manager:
                raise HTTPException(status_code=400, detail="Invalid property manager ID")
            
            property.property_manager = manager
        else:
            property.property_manager = None
    
    property.save()
    return property_to_response(property)

@app.post("/properties/{property_id}/images/")
async def upload_property_image(
    property_id: int,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    caption: str = Form(""),
    current_user: User = Depends(get_current_user)
):
    # Get property
    property = Property.objects.filter(id=property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if (current_user.is_landlord() and property.owner_id != current_user.id) or \
       (current_user.is_property_manager() and property.property_manager_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to upload images for this property")
    
    # Create image
    content = await file.read()
    property_image = PropertyImage(
        property=property,
        caption=caption,
        is_primary=is_primary
    )
    property_image.image.save(
        file.filename,
        ContentFile(content)
    )
    property_image.save()
    
    # If setting as primary, unset other primary images
    if is_primary:
        PropertyImage.objects.filter(property=property, is_primary=True).exclude(id=property_image.id).update(is_primary=False)
    
    return {"message": "Image uploaded successfully", "image_id": property_image.id}

@app.post("/properties/{property_id}/documents/")
async def upload_property_document(
    property_id: int,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    current_user: User = Depends(get_current_user)
):
    # Get property
    property = Property.objects.filter(id=property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if (current_user.is_landlord() and property.owner_id != current_user.id) or \
       (current_user.is_property_manager() and property.property_manager_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this property")
    
    # Create document
    content = await file.read()
    property_document = PropertyDocument(
        property=property,
        title=title,
        description=description
    )
    property_document.document.save(
        file.filename,
        ContentFile(content)
    )
    property_document.save()
    
    return {"message": "Document uploaded successfully", "document_id": property_document.id}

# Lease endpoints
@app.get("/leases/", response_model=List[LeaseResponse])
async def list_leases(
    is_active: Optional[bool] = None,
    property_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q()
    
    # Filter based on user role
    if current_user.is_tenant():
        query &= Q(tenant=current_user)
    elif current_user.is_property_manager():
        query &= Q(property__property_manager=current_user)
    elif current_user.is_landlord():
        query &= Q(property__owner=current_user)
    # Admins see all
    
    # Apply filters
    if is_active is not None:
        query &= Q(is_active=is_active)
    if property_id:
        query &= Q(property_id=property_id)
    
    leases = Lease.objects.filter(query)
    return [lease_to_response(lease) for lease in leases]

@app.post("/leases/", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
async def create_lease(
    lease_data: LeaseCreate,
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if not (current_user.is_admin() or current_user.is_landlord() or current_user.is_property_manager()):
        raise HTTPException(status_code=403, detail="Not authorized to create leases")
    
    # Get property
    property = Property.objects.filter(id=lease_data.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check property permissions
    if current_user.is_landlord() and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create lease for this property")
    
    if current_user.is_property_manager() and property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create lease for this property")
    
    # Get tenant
    tenant = User.objects.filter(id=lease_data.tenant_id, role=User.Role.TENANT).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Create lease
    new_lease = Lease(
        property=property,
        tenant=tenant,
        start_date=lease_data.start_date,
        end_date=lease_data.end_date,
        rent_amount=lease_data.rent_amount,
        deposit_amount=lease_data.deposit_amount,
        is_active=lease_data.is_active
    )
    new_lease.save()
    
    # Update property status if lease is active
    if new_lease.is_active:
        property.status = Property.Status.RENTED
        property.save()
    
    return lease_to_response(new_lease)

@app.get("/leases/{lease_id}/", response_model=LeaseResponse)
async def get_lease(
    lease_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get lease
    lease = Lease.objects.filter(id=lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Check permissions
    if current_user.is_tenant() and lease.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lease")
    
    if current_user.is_property_manager() and lease.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lease")
    
    if current_user.is_landlord() and lease.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lease")
    
    return lease_to_response(lease)

@app.put("/leases/{lease_id}/", response_model=LeaseResponse)
async def update_lease(
    lease_id: int,
    lease_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    # Get lease
    lease = Lease.objects.filter(id=lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Check permissions
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Tenants cannot update leases")
    
    if current_user.is_property_manager() and lease.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this lease")
    
    if current_user.is_landlord() and lease.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this lease")
    
    # Fields that can be updated
    updatable_fields = ["start_date", "end_date", "rent_amount", "deposit_amount", "is_active"]
    
    # Update fields
    for field in updatable_fields:
        if field in lease_data:
            setattr(lease, field, lease_data[field])
    
    # Special handling for tenant change
    if "tenant_id" in lease_data and (current_user.is_admin() or current_user.is_landlord()):
        tenant = User.objects.filter(id=lease_data["tenant_id"], role=User.Role.TENANT).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        lease.tenant = tenant
    
    lease.save()
    
    # Update property status based on lease status
    if lease.is_active:
        lease.property.status = Property.Status.RENTED
    else:
        # Check if there are other active leases for this property
        other_active_leases = Lease.objects.filter(
            property=lease.property, 
            is_active=True
        ).exclude(id=lease.id).exists()
        
        if not other_active_leases:
            lease.property.status = Property.Status.AVAILABLE
    
    lease.property.save()
    
    return lease_to_response(lease)

@app.post("/leases/{lease_id}/document/")
async def upload_lease_document(
    lease_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Get lease
    lease = Lease.objects.filter(id=lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Check permissions
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Tenants cannot upload lease documents")
    
    if current_user.is_property_manager() and lease.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this lease")
    
    if current_user.is_landlord() and lease.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this lease")
    
    # Upload document
    # Upload document
    content = await file.read()
    lease.lease_document.save(
        file.filename,
        ContentFile(content)
    )
    lease.save()
    
    return {"message": "Lease document uploaded successfully"}

# Maintenance request endpoints
@app.get("/maintenance-requests/", response_model=List[MaintenanceRequestResponse])
async def list_maintenance_requests(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    property_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q()
    
    # Filter based on user role
    if current_user.is_tenant():
        query &= Q(tenant=current_user)
    elif current_user.is_property_manager():
        query &= Q(property__property_manager=current_user) | Q(assigned_to=current_user)
    elif current_user.is_landlord():
        query &= Q(property__owner=current_user)
    # Admins see all
    
    # Apply filters
    if status:
        query &= Q(status=status)
    if priority:
        query &= Q(priority=priority)
    if property_id:
        query &= Q(property_id=property_id)
    
    requests = MaintenanceRequest.objects.filter(query).order_by('-created_at')
    return [maintenance_to_response(req) for req in requests]

@app.post("/maintenance-requests/", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_maintenance_request(
    request_data: MaintenanceRequestCreate,
    current_user: User = Depends(get_current_user)
):
    # Get property
    property = Property.objects.filter(id=request_data.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    is_tenant = current_user.is_tenant()
    if is_tenant:
        # Check if tenant has an active lease for this property
        has_lease = Lease.objects.filter(
            property=property,
            tenant=current_user,
            is_active=True
        ).exists()
        
        if not has_lease:
            raise HTTPException(
                status_code=403, 
                detail="You can only create maintenance requests for properties you're renting"
            )
    
    # Create request
    new_request = MaintenanceRequest(
        property=property,
        tenant=current_user if is_tenant else None,
        title=request_data.title,
        description=request_data.description,
        priority=request_data.priority,
        status=MaintenanceRequest.Status.PENDING
    )
    new_request.save()
    
    # Create notification for property manager if exists
    if property.property_manager:
        Notification.objects.create(
            user=property.property_manager,
            type=Notification.Type.MAINTENANCE_UPDATE,
            title="New maintenance request",
            message=f"New maintenance request for {property.name}: {request_data.title}",
            content_type="maintenance",
            object_id=new_request.id
        )
    
    # Create notification for property owner
    Notification.objects.create(
        user=property.owner,
        type=Notification.Type.MAINTENANCE_UPDATE,
        title="New maintenance request",
        message=f"New maintenance request for {property.name}: {request_data.title}",
        content_type="maintenance",
        object_id=new_request.id
    )
    
    return maintenance_to_response(new_request)

@app.get("/maintenance-requests/{request_id}/", response_model=MaintenanceRequestResponse)
async def get_maintenance_request(
    request_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get request
    request = MaintenanceRequest.objects.filter(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Check permissions
    if current_user.is_tenant() and request.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this maintenance request")
    
    if current_user.is_property_manager() and \
       request.property.property_manager_id != current_user.id and \
       request.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this maintenance request")
    
    if current_user.is_landlord() and request.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this maintenance request")
    
    return maintenance_to_response(request)

@app.put("/maintenance-requests/{request_id}/", response_model=MaintenanceRequestResponse)
async def update_maintenance_request(
    request_id: int,
    request_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    # Get request
    request = MaintenanceRequest.objects.filter(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Check permissions
    if current_user.is_tenant() and request.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this maintenance request")
    
    if current_user.is_property_manager() and \
       request.property.property_manager_id != current_user.id and \
       request.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this maintenance request")
    
    if current_user.is_landlord() and request.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this maintenance request")
    
    # Fields that can be updated by tenants
    tenant_updatable_fields = ["title", "description"]
    
    # Fields that can be updated by property managers and landlords
    manager_updatable_fields = [
        "title", "description", "priority", "status", 
        "estimated_cost", "actual_cost"
    ]
    
    # Determine which fields can be updated based on role
    updatable_fields = tenant_updatable_fields if current_user.is_tenant() else manager_updatable_fields
    
    # Update fields
    for field in updatable_fields:
        if field in request_data:
            setattr(request, field, request_data[field])
    
    # Special handling for assigned_to
    if "assigned_to_id" in request_data and not current_user.is_tenant():
        if request_data["assigned_to_id"]:
            assigned_to = User.objects.filter(id=request_data["assigned_to_id"]).first()
            if not assigned_to:
                raise HTTPException(status_code=400, detail="Invalid user ID for assignment")
            request.assigned_to = assigned_to
        else:
            request.assigned_to = None
    
    # Handle resolved_at when status is changed to RESOLVED
    if request.status == MaintenanceRequest.Status.RESOLVED and not request.resolved_at:
        request.resolved_at = timezone.now()
    elif request.status != MaintenanceRequest.Status.RESOLVED:
        request.resolved_at = None
    
    request.save()
    
    # Create notification for tenant if status changes
    if "status" in request_data and request.tenant:
        Notification.objects.create(
            user=request.tenant,
            type=Notification.Type.MAINTENANCE_UPDATE,
            title=f"Maintenance request update: {request.title}",
            message=f"Status changed to: {request.get_status_display()}",
            content_type="maintenance",
            object_id=request.id
        )
    
    return maintenance_to_response(request)

@app.post("/maintenance-requests/{request_id}/comments/")
async def add_maintenance_comment(
    request_id: int,
    comment: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    # Get request
    request = MaintenanceRequest.objects.filter(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Check permissions
    if current_user.is_tenant() and request.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this maintenance request")
    
    if current_user.is_property_manager() and \
       request.property.property_manager_id != current_user.id and \
       request.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this maintenance request")
    
    if current_user.is_landlord() and request.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this maintenance request")
    
    # Create comment
    maintenance_comment = MaintenanceComment(
        maintenance_request=request,
        user=current_user,
        comment=comment
    )
    maintenance_comment.save()
    
    # Create notifications for relevant users
    notify_users = []
    
    # Notify tenant (if not the commenter)
    if request.tenant and request.tenant.id != current_user.id:
        notify_users.append(request.tenant)
    
    # Notify property manager (if exists and not the commenter)
    if request.property.property_manager and request.property.property_manager.id != current_user.id:
        notify_users.append(request.property.property_manager)
    
    # Notify property owner (if not the commenter)
    if request.property.owner.id != current_user.id:
        notify_users.append(request.property.owner)
    
    # Notify assigned maintenance staff (if exists and not the commenter)
    if request.assigned_to and request.assigned_to.id != current_user.id:
        notify_users.append(request.assigned_to)
    
    # Create notifications
    for user in notify_users:
        Notification.objects.create(
            user=user,
            type=Notification.Type.MAINTENANCE_UPDATE,
            title=f"New comment on: {request.title}",
            message=f"{current_user.first_name} {current_user.last_name}: {comment[:50]}{'...' if len(comment) > 50 else ''}",
            content_type="maintenance_comment",
            object_id=maintenance_comment.id
        )
    
    return {
        "message": "Comment added successfully",
        "comment_id": maintenance_comment.id,
        "created_at": maintenance_comment.created_at
    }

@app.get("/maintenance-requests/{request_id}/comments/")
async def get_maintenance_comments(
    request_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get request
    request = MaintenanceRequest.objects.filter(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Check permissions
    if current_user.is_tenant() and request.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view comments for this maintenance request")
    
    if current_user.is_property_manager() and \
       request.property.property_manager_id != current_user.id and \
       request.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view comments for this maintenance request")
    
    if current_user.is_landlord() and request.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view comments for this maintenance request")
    
    # Get comments
    comments = MaintenanceComment.objects.filter(maintenance_request=request).order_by('created_at')
    
    # Format response
    response = []
    for comment in comments:
        response.append({
            "id": comment.id,
            "user_id": comment.user_id,
            "user_name": f"{comment.user.first_name} {comment.user.last_name}",
            "comment": comment.comment,
            "created_at": comment.created_at
        })
    
    return response

@app.post("/maintenance-requests/{request_id}/images/")
async def upload_maintenance_image(
    request_id: int,
    file: UploadFile = File(...),
    caption: str = Form(""),
    current_user: User = Depends(get_current_user)
):
    # Get request
    request = MaintenanceRequest.objects.filter(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    # Check permissions
    if current_user.is_tenant() and request.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload images for this maintenance request")
    
    if current_user.is_property_manager() and \
       request.property.property_manager_id != current_user.id and \
       request.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload images for this maintenance request")
    
    if current_user.is_landlord() and request.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload images for this maintenance request")
    
    # Create image
    content = await file.read()
    maintenance_image = MaintenanceImage(
        maintenance_request=request,
        caption=caption
    )
    maintenance_image.image.save(
        file.filename,
        ContentFile(content)
    )
    maintenance_image.save()
    
    return {"message": "Image uploaded successfully", "image_id": maintenance_image.id}

# Invoice endpoints
@app.get("/invoices/", response_model=List[InvoiceResponse])
async def list_invoices(
    status: Optional[str] = None,
    property_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q()
    
    # Filter based on user role
    if current_user.is_tenant():
        query &= Q(tenant=current_user)
    elif current_user.is_property_manager():
        query &= Q(property__property_manager=current_user)
    elif current_user.is_landlord():
        query &= Q(property__owner=current_user)
    # Admins see all
    
    # Apply filters
    if status:
        query &= Q(status=status)
    if property_id:
        query &= Q(property_id=property_id)
    if tenant_id and not current_user.is_tenant():
        query &= Q(tenant_id=tenant_id)
    
    invoices = Invoice.objects.filter(query).order_by('-due_date')
    return [invoice_to_response(invoice) for invoice in invoices]

@app.post("/invoices/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Tenants cannot create invoices")
    
    # Get property
    property = Property.objects.filter(id=invoice_data.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check property permissions
    if current_user.is_landlord() and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create invoice for this property")
    
    if current_user.is_property_manager() and property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create invoice for this property")
    
    # Get tenant
    tenant = User.objects.filter(id=invoice_data.tenant_id, role=User.Role.TENANT).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get lease
    lease = Lease.objects.filter(id=invoice_data.lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    
    # Verify lease belongs to property and tenant
    if lease.property_id != property.id or lease.tenant_id != tenant.id:
        raise HTTPException(status_code=400, detail="Lease does not match property and tenant")
    
    # Create invoice
    new_invoice = Invoice(
        tenant=tenant,
        property=property,
        lease=lease,
        amount=invoice_data.amount,
        description=invoice_data.description,
        due_date=invoice_data.due_date,
        status=Invoice.Status.PENDING
    )
    new_invoice.save()
    
    # Create notification for tenant
    Notification.objects.create(
        user=tenant,
        type=Notification.Type.PAYMENT_DUE,
        title="New invoice",
        message=f"You have a new invoice of ${new_invoice.amount} due on {new_invoice.due_date}",
        content_type="invoice",
        object_id=new_invoice.id
    )
    
    return invoice_to_response(new_invoice)

@app.get("/invoices/{invoice_id}/", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get invoice
    invoice = Invoice.objects.filter(id=invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check permissions
    if current_user.is_tenant() and invoice.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice")
    
    if current_user.is_property_manager() and invoice.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice")
    
    if current_user.is_landlord() and invoice.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice")
    
    return invoice_to_response(invoice)

@app.put("/invoices/{invoice_id}/", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    # Get invoice
    invoice = Invoice.objects.filter(id=invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check permissions
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Tenants cannot update invoices")
    
    if current_user.is_property_manager() and invoice.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this invoice")
    
    if current_user.is_landlord() and invoice.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this invoice")
    
    # Fields that can be updated
    updatable_fields = ["amount", "description", "due_date", "status"]
    
    # Update fields
    for field in updatable_fields:
        if field in invoice_data:
            setattr(invoice, field, invoice_data[field])
    
    invoice.save()
    
    # Create notification for tenant if status changes
    if "status" in invoice_data:
        Notification.objects.create(
            user=invoice.tenant,
            type=Notification.Type.PAYMENT_DUE,
            title=f"Invoice status updated",
            message=f"Your invoice #{invoice.id} status is now: {invoice.get_status_display()}",
            content_type="invoice",
            object_id=invoice.id
        )
    
    return invoice_to_response(invoice)

# Payment endpoints
@app.get("/payments/", response_model=List[PaymentResponse])
async def list_payments(
    invoice_id: Optional[int] = None,
    property_id: Optional[int] = None,
    tenant_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q()
    
    # Filter based on user role
    if current_user.is_tenant():
        query &= Q(invoice__tenant=current_user)
    elif current_user.is_property_manager():
        query &= Q(invoice__property__property_manager=current_user)
    elif current_user.is_landlord():
        query &= Q(invoice__property__owner=current_user)
    # Admins see all
    
    # Apply filters
    if invoice_id:
        query &= Q(invoice_id=invoice_id)
    if property_id:
        query &= Q(invoice__property_id=property_id)
    if tenant_id and not current_user.is_tenant():
        query &= Q(invoice__tenant_id=tenant_id)
    
    payments = Payment.objects.filter(query).order_by('-payment_date')
    return [payment_to_response(payment) for payment in payments]

@app.post("/payments/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user)
):
    # Get invoice
    invoice = Invoice.objects.filter(id=payment_data.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check permissions
    if current_user.is_tenant() and invoice.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to make payment for this invoice")
    
    if current_user.is_property_manager() and invoice.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to record payment for this invoice")
    
    if current_user.is_landlord() and invoice.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to record payment for this invoice")
    
    # Create payment
    new_payment = Payment(
        invoice=invoice,
        amount=payment_data.amount,
        payment_date=timezone.now(),
        payment_method=payment_data.payment_method,
        transaction_id=payment_data.transaction_id,
        notes=payment_data.notes
    )
    new_payment.save()
    
    # Update invoice status if paid in full
    total_paid = Payment.objects.filter(invoice=invoice).aggregate(Sum('amount'))['amount__sum'] or 0
    if total_paid >= invoice.amount:
        invoice.status = Invoice.Status.PAID
        invoice.save()
    
    # Create notifications
    if current_user.is_tenant():
        # Notify property manager
        if invoice.property.property_manager:
            Notification.objects.create(
                user=invoice.property.property_manager,
                type=Notification.Type.PAYMENT_RECEIVED,
                title="Payment received",
                message=f"Payment of ${new_payment.amount} received for invoice #{invoice.id}",
                content_type="payment",
                object_id=new_payment.id
            )
        
        # Notify property owner
        Notification.objects.create(
            user=invoice.property.owner,
            type=Notification.Type.PAYMENT_RECEIVED,
            title="Payment received",
            message=f"Payment of ${new_payment.amount} received for invoice #{invoice.id}",
            content_type="payment",
            object_id=new_payment.id
        )
    else:
        # Notify tenant
        Notification.objects.create(
            user=invoice.tenant,
            type=Notification.Type.PAYMENT_RECEIVED,
            title="Payment recorded",
            message=f"Payment of ${new_payment.amount} has been recorded for invoice #{invoice.id}",
            content_type="payment",
            object_id=new_payment.id
        )
    
    return payment_to_response(new_payment)

@app.get("/payments/{payment_id}/", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get payment
    payment = Payment.objects.filter(id=payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check permissions
    if current_user.is_tenant() and payment.invoice.tenant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    
    if current_user.is_property_manager() and payment.invoice.property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    
    if current_user.is_landlord() and payment.invoice.property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    
    return payment_to_response(payment)

# Notification endpoints
@app.get("/notifications/")
async def list_notifications(
    is_read: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    # Base query
    query = Q(user=current_user)
    
    # Apply filters
    if is_read is not None:
        query &= Q(is_read=is_read)
    
    notifications = Notification.objects.filter(query).order_by('-created_at')
    
    # Format response
    response = []
    for notification in notifications:
        response.append({
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "content_type": notification.content_type,
            "object_id": notification.object_id,
            "created_at": notification.created_at
        })
    
    return response

@app.put("/notifications/{notification_id}/read/")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get notification
    notification = Notification.objects.filter(id=notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check permissions
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    # Mark as read
    notification.is_read = True
    notification.save()
    
    return {"message": "Notification marked as read"}

@app.put("/notifications/read-all/")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user)
):
    # Mark all user's notifications as read
    Notification.objects.filter(user=current_user, is_read=False).update(is_read=True)
    
    return {"message": "All notifications marked as read"}

# Dashboard endpoints
@app.get("/dashboard/landlord-summary/")
async def landlord_dashboard_summary(
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if not current_user.is_landlord() and not current_user.is_admin():
        raise HTTPException(status_code=403, detail="Not authorized to access landlord dashboard")
    
    # Base query for properties
    property_query = Q()
    if current_user.is_landlord():
        property_query &= Q(owner=current_user)
    
    # Get summary data
    total_properties = Property.objects.filter(property_query).count()
    occupied_properties = Property.objects.filter(property_query, status=Property.Status.RENTED).count()
    available_properties = Property.objects.filter(property_query, status=Property.Status.AVAILABLE).count()
    maintenance_properties = Property.objects.filter(property_query, status=Property.Status.MAINTENANCE).count()
    
    # Get pending/overdue payments
    pending_invoices = Invoice.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=Invoice.Status.PENDING
    ).count()
    
    overdue_invoices = Invoice.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=Invoice.Status.OVERDUE
    ).count()
    
    # Get maintenance requests
    pending_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=MaintenanceRequest.Status.PENDING
    ).count()
    
    in_progress_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=MaintenanceRequest.Status.IN_PROGRESS
    ).count()
    
    # Calculate occupancy rate
    occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0
    
    # Get recent activities
    recent_leases = Lease.objects.filter(
        property__in=Property.objects.filter(property_query)
    ).order_by('-created_at')[:5]
    
    recent_payments = Payment.objects.filter(
        invoice__property__in=Property.objects.filter(property_query)
    ).order_by('-payment_date')[:5]
    
    # Format response
    return {
        "properties_summary": {
            "total": total_properties,
            "occupied": occupied_properties,
            "available": available_properties,
            "under_maintenance": maintenance_properties,
            "occupancy_rate": round(occupancy_rate, 2)
        },
        "financial_summary": {
            "pending_invoices": pending_invoices,
            "overdue_invoices": overdue_invoices,
        },
        "maintenance_summary": {
            "pending_requests": pending_maintenance,
            "in_progress_requests": in_progress_maintenance,
        },
        "recent_leases": [
            {
                "id": lease.id,
                "property_name": lease.property.name,
                "tenant_name": f"{lease.tenant.first_name} {lease.tenant.last_name}",
                "start_date": lease.start_date,
                "end_date": lease.end_date,
                "rent_amount": lease.rent_amount,
                "created_at": lease.created_at
            }
            for lease in recent_leases
        ],
        "recent_payments": [
            {
                "id": payment.id,
                "invoice_id": payment.invoice_id,
                "tenant_name": f"{payment.invoice.tenant.first_name} {payment.invoice.tenant.last_name}",
                "amount": payment.amount,
                "payment_date": payment.payment_date,
                "payment_method": payment.payment_method
            }
            for payment in recent_payments
        ]
    }

@app.get("/dashboard/tenant-summary/")
async def tenant_dashboard_summary(
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if not current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Not authorized to access tenant dashboard")
    
    # Get active leases
    active_leases = Lease.objects.filter(tenant=current_user, is_active=True)
    
    # Get pending invoices
    pending_invoices = Invoice.objects.filter(
        tenant=current_user,
        status=Invoice.Status.PENDING
    ).order_by('due_date')
    
    # Get pending maintenance requests
    maintenance_requests = MaintenanceRequest.objects.filter(
        tenant=current_user
    ).order_by('-created_at')
    
    # Get recent payments
    recent_payments = Payment.objects.filter(
        invoice__tenant=current_user
    ).order_by('-payment_date')[:5]
    
    # Get recent notifications
    recent_notifications = Notification.objects.filter(
        user=current_user
    ).order_by('-created_at')[:5]
    
    # Format response
    return {
        "leases": [
            {
                "id": lease.id,
                "property_name": lease.property.name,
                "property_address": lease.property.address,
                "start_date": lease.start_date,
                "end_date": lease.end_date,
                "rent_amount": lease.rent_amount,
                "days_remaining": (lease.end_date - timezone.now().date()).days
            }
            for lease in active_leases
        ],
        "invoices": [
            {
                "id": invoice.id,
                "property_name": invoice.property.name,
                "amount": invoice.amount,
                "due_date": invoice.due_date,
                "status": invoice.status,
                "days_until_due": (invoice.due_date - timezone.now().date()).days
            }
            for invoice in pending_invoices
        ],
        "maintenance_requests": [
            {
                "id": req.id,
                "property_name": req.property.name,
                "title": req.title,
                "status": req.status,
                "priority": req.priority,
                "created_at": req.created_at
            }
            for req in maintenance_requests
        ],
        "recent_payments": [
            {
                "id": payment.id,
                "invoice_id": payment.invoice_id,
                "property_name": payment.invoice.property.name,
                "amount": payment.amount,
                "payment_date": payment.payment_date,
                "payment_method": payment.payment_method
            }
            for payment in recent_payments
        ],
        "recent_notifications": [
            {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "is_read": notification.is_read,
                "created_at": notification.created_at
            }
            for notification in recent_notifications
        ]
    }

@app.get("/dashboard/property-manager-summary/")
async def property_manager_dashboard_summary(
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if not current_user.is_property_manager() and not current_user.is_admin():
        raise HTTPException(status_code=403, detail="Not authorized to access property manager dashboard")
    
    # Base query for properties
    property_query = Q()
    if current_user.is_property_manager():
        property_query &= Q(property_manager=current_user)
    
    # Get managed properties
    managed_properties = Property.objects.filter(property_query).count()
    
    # Get maintenance requests
    pending_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=MaintenanceRequest.Status.PENDING
    ).count()
    
    in_progress_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=MaintenanceRequest.Status.IN_PROGRESS
    ).count()
    
    resolved_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query),
        status=MaintenanceRequest.Status.RESOLVED
    ).count()
    
    # Get lease information
    active_leases = Lease.objects.filter(
        property__in=Property.objects.filter(property_query),
        is_active=True
    ).count()
    
    expiring_leases = Lease.objects.filter(
        property__in=Property.objects.filter(property_query),
        is_active=True,
        end_date__lte=timezone.now().date() + timezone.timedelta(days=30)
    ).count()
    
    # Get recent maintenance requests
    recent_maintenance = MaintenanceRequest.objects.filter(
        property__in=Property.objects.filter(property_query)
    ).order_by('-created_at')[:5]
    
    # Format response
    return {
        "properties_summary": {
            "managed_properties": managed_properties,
            "active_leases": active_leases,
            "expiring_leases": expiring_leases
        },
        "maintenance_summary": {
            "pending_requests": pending_maintenance,
            "in_progress_requests": in_progress_maintenance,
            "resolved_requests": resolved_maintenance,
        },
        "recent_maintenance_requests": [
            {
                "id": req.id,
                "property_name": req.property.name,
                "tenant_name": f"{req.tenant.first_name} {req.tenant.last_name}" if req.tenant else "N/A",
                "title": req.title,
                "status": req.status,
                "priority": req.priority,
                "created_at": req.created_at
            }
            for req in recent_maintenance
        ]
    }

# User search endpoints (for selecting users when assigning roles)
@app.get("/users/search/")
async def search_users(
    role: Optional[str] = None,
    query: str = Query(None, min_length=2),
    current_user: User = Depends(get_current_user)
):
    # Only admins, landlords, and property managers can search users
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Not authorized to search users")
    
    # Base query
    db_query = Q()
    
    # Apply role filter
    if role:
        db_query &= Q(role=role)
    
    # Apply search query
    if query:
        db_query &= (
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query) | 
            Q(email__icontains=query)
        )
    
    # Get users
    users = User.objects.filter(db_query)[:10]  # Limit to 10 results
    
    # Format response
    response = []
    for user in users:
        response.append({
            "id": user.id,
            "username": user.username,
            "full_name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role
        })
    
    return response

# Property statistics endpoint
@app.get("/properties/{property_id}/statistics/")
async def get_property_statistics(
    property_id: int,
    current_user: User = Depends(get_current_user)
):
    # Get property
    property = Property.objects.filter(id=property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check permissions
    if current_user.is_tenant():
        raise HTTPException(status_code=403, detail="Not authorized to view property statistics")
    
    if current_user.is_property_manager() and property.property_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view statistics for this property")
    
    if current_user.is_landlord() and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view statistics for this property")
    
    # Calculate statistics
    
    # Lease history
    total_leases = Lease.objects.filter(property=property).count()
    current_leases = Lease.objects.filter(property=property, is_active=True).count()
    
    # Financial data
    total_invoiced = Invoice.objects.filter(property=property).aggregate(Sum('amount'))['amount__sum'] or 0
    total_collected = Payment.objects.filter(invoice__property=property).aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Calculate average lease duration in days
    leases = Lease.objects.filter(property=property)
    total_days = 0
    for lease in leases:
        total_days += (lease.end_date - lease.start_date).days
    
    avg_lease_duration = total_days // total_leases if total_leases > 0 else 0
    
    # Maintenance statistics
    maintenance_requests = MaintenanceRequest.objects.filter(property=property)
    total_maintenance = maintenance_requests.count()
    
    maintenance_by_priority = {
        MaintenanceRequest.Priority.LOW: maintenance_requests.filter(priority=MaintenanceRequest.Priority.LOW).count(),
        MaintenanceRequest.Priority.MEDIUM: maintenance_requests.filter(priority=MaintenanceRequest.Priority.MEDIUM).count(),
        MaintenanceRequest.Priority.HIGH: maintenance_requests.filter(priority=MaintenanceRequest.Priority.HIGH).count(),
        MaintenanceRequest.Priority.EMERGENCY: maintenance_requests.filter(priority=MaintenanceRequest.Priority.EMERGENCY).count()
    }
    
    maintenance_by_status = {
        MaintenanceRequest.Status.PENDING: maintenance_requests.filter(status=MaintenanceRequest.Status.PENDING).count(),
        MaintenanceRequest.Status.IN_PROGRESS: maintenance_requests.filter(status=MaintenanceRequest.Status.IN_PROGRESS).count(),
        MaintenanceRequest.Status.RESOLVED: maintenance_requests.filter(status=MaintenanceRequest.Status.RESOLVED).count(),
        MaintenanceRequest.Status.CANCELLED: maintenance_requests.filter(status=MaintenanceRequest.Status.CANCELLED).count()
    }
    
    # Calculate average days to resolve maintenance requests
    resolved_requests = maintenance_requests.filter(status=MaintenanceRequest.Status.RESOLVED, resolved_at__isnull=False)
    total_resolution_days = 0
    for req in resolved_requests:
        total_resolution_days += (req.resolved_at.date() - req.created_at.date()).days
    
    avg_resolution_days = total_resolution_days // resolved_requests.count() if resolved_requests.count() > 0 else 0
    
    total_maintenance_cost = maintenance_requests.aggregate(Sum('actual_cost'))['actual_cost__sum'] or 0
    
    # Format response
    return {
        "lease_statistics": {
            "total_leases": total_leases,
            "current_leases": current_leases,
            "average_lease_duration_days": avg_lease_duration
        },
        "financial_statistics": {
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "collection_rate": round(total_collected / total_invoiced * 100, 2) if total_invoiced > 0 else 0
        },
        "maintenance_statistics": {
            "total_requests": total_maintenance,
            "requests_by_priority": maintenance_by_priority,
            "requests_by_status": maintenance_by_status,
            "average_resolution_days": avg_resolution_days,
            "total_maintenance_cost": total_maintenance_cost
        }
    }

# Health check endpoint
@app.get("/health/")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": timezone.now()
    }

# Start the FastAPI app when the script is run directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)