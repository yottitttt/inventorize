from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base

class GradeEnum(str, enum.Enum):
    U4 = "U4"
    M1 = "M1"
    M2 = "M2"
    OB_OG = "OB_OG"

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    grade = Column(Enum(GradeEnum), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # リレーションシップ
    transactions = relationship("ItemTransaction", back_populates="user")
    search_logs = relationship("SearchLog", back_populates="user")

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # リレーションシップ
    items = relationship("Item", back_populates="category")

class Item(Base):
    __tablename__ = "item"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="SET NULL"))
    is_available = Column(Boolean, default=True)
    location = Column(String(255))
    registration_date = Column(DateTime, server_default=func.now())
    image_path = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # リレーションシップ
    category = relationship("Category", back_populates="items")
    transactions = relationship("ItemTransaction", back_populates="item")

class ItemTransaction(Base):
    __tablename__ = "item_transaction"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("item.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum("borrow", "return"), nullable=False)
    related_transaction_id = Column(Integer, ForeignKey("item_transaction.id", ondelete="SET NULL"))
    transaction_date = Column(DateTime, server_default=func.now())
    reason = Column(String(255))
    item_condition = Column(String(255))
    notes = Column(Text)
    status = Column(String(20), default="request")
    created_at = Column(DateTime, server_default=func.now())

    # リレーションシップ
    item = relationship("Item", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
    related_transaction = relationship("ItemTransaction", remote_side=[id], uselist=False)
    child_transactions = relationship("ItemTransaction", remote_side=[related_transaction_id])

class SearchLog(Base):
    __tablename__ = "search_log"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="SET NULL"))
    search_keyword = Column(String(255), nullable=False)
    searched_at = Column(DateTime, server_default=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="search_logs")