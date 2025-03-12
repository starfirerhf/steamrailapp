# Use Python as base image
FROM python:3.10

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose both Flask (5000) & FastAPI (8000) ports
EXPOSE 5000 8000

# Run both Flask and FastAPI using Supervisor
CMD ["sh", "-c", "python auth.py --host 0.0.0.0 --port 5000 & uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
