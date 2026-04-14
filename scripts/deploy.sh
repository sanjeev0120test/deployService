#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="deploy-services"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Building Docker images ==="

docker build -t fastify-service:latest "$ROOT_DIR/services/fastify-service"
docker build -t nextjs-service:latest "$ROOT_DIR/services/nextjs-service"
docker build -t fastapi-service:latest "$ROOT_DIR/services/fastapi-service"

echo "=== Loading images into Kind ==="

kind load docker-image fastify-service:latest --name "$CLUSTER_NAME"
kind load docker-image nextjs-service:latest --name "$CLUSTER_NAME"
kind load docker-image fastapi-service:latest --name "$CLUSTER_NAME"

echo "=== Deploying with Helm ==="

helm upgrade --install deploy-services "$ROOT_DIR/helm/deploy-services" \
    --namespace deploy-services \
    --create-namespace \
    --wait \
    --timeout 120s

echo "=== Deployment complete ==="
echo ""
echo "Services accessible via NGINX Ingress at http://localhost:"
echo "  Fastify:  http://localhost/fastify/health"
echo "  Fastify:  http://localhost/fastify/api/items"
echo "  Next.js:  http://localhost/nextjs/api/health"
echo "  Next.js:  http://localhost/nextjs/api/products"
echo "  FastAPI:  http://localhost/fastapi/health"
echo "  FastAPI:  http://localhost/fastapi/api/orders"
echo ""
echo "Check pod status: kubectl get pods -n deploy-services"
