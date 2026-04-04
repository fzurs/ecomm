FROM python:3.13.12-alpine

EXPOSE 8000

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN python -m pip install -r requirements.txt

WORKDIR /app
COPY . /app

RUN python manage.py migrate
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
