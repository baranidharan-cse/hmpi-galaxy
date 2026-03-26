FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend code and models
COPY . .

# Start the FastAPI server using the dynamic PORT provided by Render
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
