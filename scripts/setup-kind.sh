#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="deploy-services"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Checking prerequisites ==="
for cmd in kind kubectl helm docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is not installed or not in PATH"
    exit 1
  fi
done

if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "Cluster '${CLUSTER_NAME}' already exists. Delete it first with: kind delete cluster --name ${CLUSTER_NAME}"
  exit 0
fi

echo "=== Creating Kind cluster ==="
kind create cluster --name "$CLUSTER_NAME" --config "${SCRIPT_DIR}/kind-config.yaml" --wait 60s

echo "=== Installing NGINX Ingress Controller ==="
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/kind/deploy.yaml

echo "=== Waiting for Ingress Controller to be ready ==="
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "=== Kind cluster '${CLUSTER_NAME}' is ready ==="
echo "Run scripts/deploy.sh to build and deploy services."
