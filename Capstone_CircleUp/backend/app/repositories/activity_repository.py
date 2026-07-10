from datetime import datetime
from sqlalchemy.orm import Session
from app.models.activity import Activity

def get_by_id(db: Session, activity_id: int, lock: bool = False) -> Activity | None:
    query = db.query(Activity).filter(Activity.id == activity_id)
    if lock:
        query = query.with_for_update()
    return query.first()

def create(db: Session, activity: Activity) -> Activity:
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def list_all(db: Session, category: str = None, location: str = None, date_from: datetime = None, date_to: datetime = None, sort_by_date: str = "asc") -> list[Activity]:
    query = db.query(Activity)
    if category: query = query.filter(Activity.category == category)
    if location: query = query.filter(Activity.location == location)
    if date_from: query = query.filter(Activity.date >= date_from)
    if date_to: query = query.filter(Activity.date <= date_to)
    
    if sort_by_date == "desc":
        query = query.order_by(Activity.date.desc())
    else:
        query = query.order_by(Activity.date.asc())
        
    return query.all()