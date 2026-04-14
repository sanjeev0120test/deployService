$ErrorActionPreference = "Stop"

$CLUSTER_NAME = "deploy-services"

Write-Host "=== Checking prerequisites ===" -ForegroundColor Cyan
foreach ($cmd in @("kind", "kubectl", "helm", "docker")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: $cmd is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
}

$existing = kind get clusters 2>&1
if ($existing -match $CLUSTER_NAME) {
    Write-Host "Cluster '$CLUSTER_NAME' already exists. Delete it first with: kind delete cluster --name $CLUSTER_NAME" -ForegroundColor Yellow
    exit 0
}

Write-Host "=== Creating Kind cluster ===" -ForegroundColor Cyan
kind create cluster --name $CLUSTER_NAME --config "$PSScriptRoot\kind-config.yaml" --wait 60s

Write-Host "=== Installing NGINX Ingress Controller ===" -ForegroundColor Cyan
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/kind/deploy.yaml

Write-Host "=== Waiting for Ingress Controller to be ready ===" -ForegroundColor Cyan
kubectl wait --namespace ingress-nginx `
    --for=condition=ready pod `
    --selector=app.kubernetes.io/component=controller `
    --timeout=120s

Write-Host "=== Kind cluster '$CLUSTER_NAME' is ready ===" -ForegroundColor Green
Write-Host "Run scripts\deploy.ps1 to build and deploy services." -ForegroundColor Cyan
