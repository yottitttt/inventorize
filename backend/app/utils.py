from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from .database import get_db
from . import models
import bcrypt
from datetime import datetime, timedelta
import os
import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from dotenv import load_dotenv

# 環境変数を読み込む
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

# データベース接続情報
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST", "database")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "inventory_management")

# トークン設定
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
serializer = URLSafeTimedSerializer(SECRET_KEY)

# メール設定
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD=os.getenv("SMTP_PASSWORD")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get("access_token")
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

def get_current_admin_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# SMTPリレー方式
# def send_reset_email(user_email: str):
#     # パスワードリセットトークンを生成
#     token = serializer.dumps(user_email, salt="password-reset-salt")
#     reset_url = f"http://localhost:5173/reset-password?token={token}"

#     # メール本文をプレーンテキストで作成
#     text = f"""\
# パスワードリセットのリクエストがありました。

# 以下のリンクから新しいパスワードを設定してください（有効期限: 30分）:

# {reset_url}

# このメールに心当たりがない場合は、無視してください。
# """

#     message = MIMEText(text, "plain", "utf-8")
#     message["Subject"] = "パスワードリセット"
#     message["From"] = SMTP_USER
#     message["To"] = user_email

#     try:
#         with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
#             server.ehlo()
#             server.starttls()
#             server.ehlo()
#             server.sendmail(SMTP_USER, user_email, message.as_string())
#         print("パスワードリセットメールを送信しました。")
#     except Exception as e:
#         print(f"メール送信エラー: {e}")

# 認証付きSMTP
def send_reset_email(user_email: str):
    # パスワードリセットトークンを生成
    token = serializer.dumps(user_email, salt="password-reset-salt")
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"

    # メール本文をプレーンテキストで作成
    text = f"""\
パスワードリセットのリクエストがありました。

以下のリンクから新しいパスワードを設定してください（有効期限: 30分）:

{reset_url}

このメールに心当たりがない場合は、無視してください。
"""

    message = MIMEText(text, "plain", "utf-8")
    message["Subject"] = "パスワードリセット"
    message["From"] = SMTP_USER
    message["To"] = user_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()                      # Gmailでは必要なことがある
            server.starttls()
            server.ehlo()                      # TLSのあと再度挨拶
            server.login(SMTP_USER, SMTP_PASSWORD)  # ここでアプリパスワードを使う
            server.sendmail(SMTP_USER, user_email, message.as_string())
        print("パスワードリセットメールを送信しました。")
    except Exception as e:
        print(f"メール送信エラー: {e}")

def verify_reset_token(token: str, max_age: int = 1800) -> str:
    try:
        email = serializer.loads(token, salt="password-reset-salt", max_age=max_age)
        return email
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="トークンの有効期限が切れています。")
    except BadSignature:
        raise HTTPException(status_code=400, detail="無効なトークンです。")       