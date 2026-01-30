FROM python:3.13-slim

WORKDIR /app

# Install system dependencies for WeasyPrint (optional, for PDF generation)
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create reports directory
RUN mkdir -p reports

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "main.py"]
