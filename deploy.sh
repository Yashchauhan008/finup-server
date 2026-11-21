#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

IMAGE="${IMAGE:-yashchauhan008/finup-server:latest}"

echo "Building & pushing $IMAGE"
docker buildx build \
  --platform linux/amd64 \
  -f Dockerfile \
  -t "$IMAGE" \
  --push .

echo "Pushed. On the VPS run ~/finup/server-up.sh to pull and restart."
