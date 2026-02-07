FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a non-root user
RUN useradd -m appuser

# Set NLTK_DATA to a writable directory
ENV NLTK_DATA=/home/appuser/nltk_data
RUN mkdir -p /home/appuser/nltk_data && chown -R appuser:appuser /home/appuser/nltk_data

RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Command is overridden by docker-compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
