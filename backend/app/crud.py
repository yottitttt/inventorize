from sqlalchemy.orm import Session, joinedload
from . import models, schemas, utils
from typing import List, Optional
from datetime import datetime, timedelta

# User CRUDロジック
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = utils.hash_password(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        grade=user.grade,
        password=hashed_pw,  
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not utils.verify_password(password, user.password):
        return None
    return user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)

        # パスワードが含まれている場合はハッシュ化
        if "password" in update_data:
            update_data["password"] = utils.hash_password(update_data.pop("password"))
 
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Category CRUDロジック
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        update_data = category.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False

# Item CRUDロジック
def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100, category_id: Optional[int] = None, name: Optional[str] = None, location: Optional[str] = None, is_available: Optional[bool] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = "asc"):
    query = db.query(models.Item)
    if category_id:
        query = query.filter(models.Item.category_id == category_id)
    if location is not None:
        query = query.filter(models.Item.location == location)
    if is_available is not None:
        query = query.filter(models.Item.is_available == is_available)
    
    if name:
        query = query.filter(models.Item.name.ilike(f"%{name}%"))
    
    if sort_by:
        sort_column = getattr(models.Item, sort_by, None)
        if sort_column is not None:
            if sort_order == "desc":
                sort_column = sort_column.desc()
            else:
                sort_column = sort_column.asc()
            query = query.order_by(sort_column)

    return query.offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(
        name=item.name,
        category_id=item.category_id,
        is_available=item.is_available,
        location=item.location,
        image_path=item.image_path,
        notes=item.notes
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item: schemas.ItemUpdate):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

# ItemTransaction CRUDロジック
def get_transaction(db: Session, transaction_id: int):
    return db.query(models.ItemTransaction).filter(models.ItemTransaction.id == transaction_id).first()

def get_transactions(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None, item_id: Optional[int] = None, status: Optional[str] = None):
    query = db.query(models.ItemTransaction).options(
        joinedload(models.ItemTransaction.user),
        joinedload(models.ItemTransaction.item).joinedload(models.Item.category)
    )
    if user_id:
        query = query.filter(models.ItemTransaction.user_id == user_id)
    if item_id:
        query = query.filter(models.ItemTransaction.item_id == item_id)
    if status:
        query = query.filter(models.ItemTransaction.status == status)

    return query.offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.ItemTransactionCreate):
    # 貸出トランザクションの場合、アイテムのステータスを更新
    if transaction.type == "borrow":
        db_item = db.query(models.Item).filter(models.Item.id == transaction.item_id).first()
        if db_item:
            db_item.is_available = False
    
    # 返却トランザクションの場合、アイテムのステータスを更新
    elif transaction.type == "return":
        db_item = db.query(models.Item).filter(models.Item.id == transaction.item_id).first()
        if db_item:
            db_item.is_available = True
    
    db_transaction = models.ItemTransaction(
        item_id=transaction.item_id,
        user_id=transaction.user_id,
        type=transaction.type,
        related_transaction_id=transaction.related_transaction_id,
        reason=transaction.reason,
        item_condition=transaction.item_condition,
        notes=transaction.notes
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

# SearchLog CRUDロジック
def create_search_log(db: Session, search_log: schemas.SearchLogCreate):
    db_search_log = models.SearchLog(
        user_id=search_log.user_id,
        search_keyword=search_log.search_keyword
    )
    db.add(db_search_log)
    db.commit()
    db.refresh(db_search_log)
    return db_search_log

def promote_all_users_grades(db: Session):
    users = db.query(models.User).all()
    for user in users:
        if user.grade == models.GradeEnum.U4:
            user.grade = models.GradeEnum.M1
        elif user.grade == models.GradeEnum.M1:
            user.grade = models.GradeEnum.M2
        elif user.grade == models.GradeEnum.M2:
            user.grade = models.GradeEnum.OB_OG
    db.commit()

def deactivate_old_users(db: Session):
    # OB_OGなら非アクティブに
    db.query(models.User).filter(
        models.User.grade.in_([models.GradeEnum.OB_OG]),  
        models.User.is_active == True  
    ).update(
        {models.User.is_active: False}, synchronize_session=False
    )
    db.commit()