from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from enum import Enum

# User関連のスキーマ
class GradeEnum(str, Enum):
    U4 = "U4"
    M1 = "M1"
    M2 = "M2"
    OB_OG = "OB_OG"

class UserLogin(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    name: str
    email: str
    grade: GradeEnum

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    grade: GradeEnum
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Category関連のスキーマ
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Item関連のスキーマ
class ItemBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    is_available: bool = True
    location: Optional[str] = None
    image_path: Optional[str] = None
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    is_available: Optional[bool] = None
    location: Optional[str] = None
    image_path: Optional[str] = None
    notes: Optional[str] = None

class Item(ItemBase):
    id: int
    registration_date: datetime
    created_at: datetime
    updated_at: datetime
    category: Optional[Category]

    class Config:
        from_attributes = True

# ItemTransaction関連のスキーマ
class ItemTransactionBase(BaseModel):
    item_id: int
    user_id: int
    type: str
    related_transaction_id: Optional[int] = None
    reason: Optional[str] = None
    item_condition: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ItemTransactionCreate(ItemTransactionBase):
    pass

class ItemTransactionUpdate(BaseModel):
    reason: Optional[str] = None
    item_condition: Optional[str] = None
    notes: Optional[str] = None

class ItemTransaction(ItemTransactionBase):
    id: int
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ItemTransactionWithDetails(ItemTransaction):
    item: Optional[Item]
    user: Optional[User]

# SearchLog関連のスキーマ
class SearchLogBase(BaseModel):
    user_id: Optional[int] = None
    search_keyword: str

class SearchLogCreate(SearchLogBase):
    pass

class SearchLog(SearchLogBase):
    id: int
    searched_at: datetime

    class Config:
        from_attributes = True