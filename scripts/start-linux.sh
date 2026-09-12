#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE_NAME="prelegal"
CONTAINER_NAME="prelegal"

if [ ! -f .env ]; then
  echo "Missing .env file. Copy .env.example to .env and fill in values first." >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

docker build -t "${IMAGE_NAME}" .
docker run -d --name "${CONTAINER_NAME}" -p 8000:8000 --env-file .env "${IMAGE_NAME}"

echo "Prelegal is running at http://localhost:8000"
