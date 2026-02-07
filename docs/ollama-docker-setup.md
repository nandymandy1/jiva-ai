# Ollama Docker Setup Guide (Ubuntu Server / Raspberry Pi 5)

## Overview

This guide explains how to:

-   Install and run Ollama using Docker
-   Pull and use LLaVA (vision model)
-   Pull and use Moondream (lightweight vision model)
-   Securely expose Ollama for local network usage
-   Integrate with a NestJS backend

------------------------------------------------------------------------

# 1. Prerequisites

-   Ubuntu Server 25.10 (ARM64 recommended for Raspberry Pi 5)
-   Docker installed and running
-   User added to docker group

Verify Docker:

``` bash
docker ps
```

------------------------------------------------------------------------

# 2. Create Persistent Volume

``` bash
docker volume create ollama
```

This ensures models persist across container restarts.

------------------------------------------------------------------------

# 3. Run Ollama Container

## Option A: Expose to Local Network

``` bash
docker run -d   --name ollama   -p 11434:11434   -v ollama:/root/.ollama   --restart unless-stopped   ollama/ollama
```

## Option B: Bind Only to Localhost (Recommended for Production)

``` bash
docker run -d   --name ollama   -p 127.0.0.1:11434:11434   -v ollama:/root/.ollama   --restart unless-stopped   ollama/ollama
```

------------------------------------------------------------------------

# 4. Verify Ollama is Running

``` bash
curl http://localhost:11434/api/tags
```

------------------------------------------------------------------------

# 5. Install Vision Models

## Pull LLaVA

``` bash
docker exec -it ollama ollama pull llava
```

Optional specific version:

``` bash
docker exec -it ollama ollama pull llava:7b
```

## Pull Moondream

``` bash
docker exec -it ollama ollama pull moondream
```

------------------------------------------------------------------------

# 6. List Installed Models

``` bash
docker exec -it ollama ollama list
```

------------------------------------------------------------------------

# 7. Test Text Chat

``` bash
curl http://localhost:11434/api/chat   -d '{
    "model": "moondream",
    "messages": [
      {"role": "user", "content": "Hello, what can you do?"}
    ]
  }'
```

------------------------------------------------------------------------

# 8. Vision Example (Image Description)

Images must be Base64 encoded before sending.

Example request format:

``` json
{
  "model": "llava",
  "messages": [
    {
      "role": "user",
      "content": "Describe this image.",
      "images": ["BASE64_ENCODED_IMAGE"]
    }
  ]
}
```

Endpoint:

    POST http://localhost:11434/api/chat

------------------------------------------------------------------------

# 9. Recommended Docker Compose Setup

Create a file named `docker-compose.yml`:

``` yaml
version: "3.9"

services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "127.0.0.1:11434:11434"
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped

volumes:
  ollama:
```

Start:

``` bash
docker compose up -d
```

------------------------------------------------------------------------

# 10. Integrating with NestJS

Inside your NestJS service:

``` ts
import axios from "axios"

await axios.post("http://127.0.0.1:11434/api/chat", {
  model: "moondream",
  messages: [{ role: "user", content: "Hello" }],
})
```

------------------------------------------------------------------------

# 11. Performance Recommendations (Raspberry Pi 5)

-   Use small quantized models (1B--3B)
-   Keep concurrency low
-   Use SSD/NVMe instead of SD card
-   Add swap if RAM is limited

------------------------------------------------------------------------

# 12. Stopping and Removing Container

Stop:

``` bash
docker stop ollama
```

Remove:

``` bash
docker rm ollama
```

Volume remains intact unless manually deleted.

------------------------------------------------------------------------

# 13. Security Notes

-   Do not expose port 11434 directly to the public internet
-   Use reverse proxy (Nginx/Caddy) if remote access required
-   Prefer binding to 127.0.0.1 and accessing via backend API

------------------------------------------------------------------------

# Setup Complete

You now have:

-   Ollama running in Docker
-   LLaVA installed
-   Moondream installed
-   REST API accessible
-   Ready for NestJS + BullMQ integration
