# Use official Bun image as base
FROM oven/bun:1.0.27-slim AS base

# Install system dependencies for Python and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    python3-pip \
    python3-dev \
    build-essential \
    && rm - rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy Bun project files and install dependencies
COPY package.json ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Set the command to run the Bun application
CMD ["bun", "run", "src/index.ts"]