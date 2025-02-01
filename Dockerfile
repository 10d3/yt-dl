# Use official Bun image as base
FROM oven/bun:1.0.27-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --no-cache-dir \
    yt-dlp \
    blinker==1.9.0 \
    click==8.1.8 \
    colorama==0.4.6 \
    Flask==2.3.2 \
    itsdangerous==2.2.0 \
    Jinja2==3.1.5 \
    MarkupSafe==3.0.2 \
    pytube==15.0.0 \
    pytubefix==8.12.0 \
    Werkzeug==3.1.3

# Create downloads directory
# RUN mkdir -p /home/bun/app/downloads

# Copy Bun project files
COPY package.json .
RUN bun install

# Copy application code
COPY . .

# Run the application
CMD ["bun", "run", "src/index.ts"]