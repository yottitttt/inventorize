# ベースイメージとして公式のPythonイメージを使用
FROM python:3.11

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をコピーしてインストール
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# FastAPIアプリケーションを起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]