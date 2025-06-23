from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from . import crud, database 
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone

scheduler = BackgroundScheduler()

def annual_user_update_job():
    db = database.SessionLocal()
    try:
        crud.promote_all_users_grades(db)  # 学年昇格
        crud.deactivate_old_users(db)      # OB_OGを無効化
    finally:
        db.close()
        
def start_scheduler():
    scheduler.add_job(
        annual_user_update_job,
        CronTrigger(month=4, day=1, hour=0, minute=0, timezone=timezone('Asia/Tokyo'))  # 毎年4月1日 0時
    )
    scheduler.start()
