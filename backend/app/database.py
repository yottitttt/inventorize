import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

import time

# 環境変数を読み込む
load_dotenv()

# データベース接続情報
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST", "database")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "inventory_management")

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

# データベースに接続するまで少し待つ
retries = 5
while retries > 0:
    try:
        # エンジン作成を試みる
        engine = create_engine(DATABASE_URL)
        engine.connect()
        break
    except Exception as e:
        retries -= 1
        print(f"データベース接続を試行中... 残り{retries}回")
        if retries == 0:
            print(f"データベース接続エラー: {e}")
            # エラーが継続する場合でもアプリケーションを起動させる
            engine = create_engine(DATABASE_URL)
        time.sleep(5)  # 5秒待つ

# エンジンとセッションの設定
# engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 依存性注入用関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()