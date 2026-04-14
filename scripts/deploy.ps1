$ErrorActionPreference = "Stop"

$CLUSTER_NAME = "deploy-services"
$ROOT_DIR = Split-Path -Parent $PSScriptRoot

Write-Host "=== Building Docker images ===" -ForegroundColor Cyan

docker build -t fastify-service:latest "$ROOT_DIR\services\fastify-service"
docker build -t nextjs-service:latest "$ROOT_DIR\services\nextjs-service"
docker build -t fastapi-service:latest "$ROOT_DIR\services\fastapi-service"

Write-Host "=== Loading images into Kind ===" -ForegroundColor Cyan

kind load docker-image fastify-service:latest --name $CLUSTER_NAME
kind load docker-image nextjs-service:latest --name $CLUSTER_NAME
kind load docker-image fastapi-service:latest --name $CLUSTER_NAME

Write-Host "=== Deploying with Helm ===" -ForegroundColor Cyan

helm upgrade --install deploy-services "$ROOT_DIR\helm\deploy-services" `
    --namespace deploy-services `
    --create-namespace `
    --wait `
    --timeout 120s

Write-Host "=== Deployment complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services accessible via NGINX Ingress at http://localhost:" -ForegroundColor Cyan
Write-Host "  Fastify:  http://localhost/fastify/health" -ForegroundColor White
Write-Host "  Fastify:  http://localhost/fastify/api/items" -ForegroundColor White
Write-Host "  Next.js:  http://localhost/nextjs/api/health" -ForegroundColor White
Write-Host "  Next.js:  http://localhost/nextjs/api/products" -ForegroundColor White
Write-Host "  FastAPI:  http://localhost/fastapi/health" -ForegroundColor White
Write-Host "  FastAPI:  http://localhost/fastapi/api/orders" -ForegroundColor White
Write-Host ""
Write-Host "Check pod status: kubectl get pods -n deploy-services" -ForegroundColor Cyan
