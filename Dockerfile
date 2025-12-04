FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

# Tu archivo es run.py con la instancia 'app'
CMD ["gunicorn", "-b", "0.0.0.0:8000", "run:app"]
