# deployService

Production-grade microservices project for deployment practice. Three services with full observability, CI/CD, Docker, Kubernetes, Helm, and Terraform -- all runnable locally on Windows with Docker Desktop and Kind.

## Architecture

```
Client -> NGINX Ingress Controller
            |-- /fastify/*  -> fastify-service  :3001  (Node.js + Fastify + TypeScript)
            |-- /nextjs/*   -> nextjs-service   :3002  (Next.js App Router)
            |-- /fastapi/*  -> fastapi-service  :8000  (Python + FastAPI)

OpenTelemetry Collector :4318  <-- OTLP traces from all services
Prometheus              :9090  --> scrapes /metrics from all services
Loki                    :3100  <-- logs from Fluent Bit
Fluent Bit              :24224 <-- Docker container log driver
Grafana                 :3000  --> queries Prometheus + Loki
```

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | Latest | https://docs.docker.com/desktop/install/windows-install/ |
| Node.js | 20+ | https://nodejs.org/ |
| Python | 3.12+ | https://python.org/ |
| Kind | Latest | `choco install kind` |
| kubectl | Latest | `choco install kubernetes-cli` |
| Helm | 3.x | `choco install kubernetes-helm` |
| GNU Make | Latest | Included with Git for Windows (Git Bash) |
| Trivy | Latest | `choco install trivy` (optional, for image scanning) |
| Terraform | 1.5+ | `choco install terraform` (optional, for IaC path) |

## Project Structure

```
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml                # Lint, test, build, scan, E2E on push/PR
│   └── deploy.yml            # Build, tag, push to GHCR on merge to main
├── services/
│   ├── fastify-service/      # Fastify + TypeScript API
│   ├── nextjs-service/       # Next.js App Router
│   └── fastapi-service/      # FastAPI (Python)
├── monitoring/
│   ├── prometheus/            # Prometheus scrape config
│   ├── grafana/               # Grafana datasource provisioning
│   ├── otel-collector/        # OpenTelemetry Collector config
│   ├── loki/                  # Loki log aggregation config
│   └── fluent-bit/            # Fluent Bit log forwarding config
├── k8s/                       # Raw Kubernetes manifests
├── helm/deploy-services/      # Helm chart
├── terraform/                 # Terraform IaC (alternative to Helm CLI)
├── tests/e2e/                 # E2E test scripts
├── scripts/                   # Kind setup and deploy scripts
├── Makefile                   # All build/test/deploy commands
└── docker-compose.yml         # Full local stack
```

## Quick Start with Makefile

All common operations are available via `make` (use Git Bash on Windows):

```bash
make help           # Show all available targets

make lint           # Lint all 3 services
make test           # Run all unit tests
make build          # Build all Docker images
make scan           # Trivy scan all images

make up             # Start full stack (services + monitoring + logging)
make e2e            # Run E2E tests against Docker Compose
make down           # Stop everything

make kind-create    # Create Kind cluster with NGINX Ingress
make k8s-deploy     # Build, load images, deploy with Helm
make k8s-e2e        # Run E2E tests against Kind Ingress
make k8s-delete     # Remove Helm release and namespace
make kind-delete    # Delete Kind cluster

make clean          # Remove build artifacts
```

## Running Locally

### Option 1: Docker Compose (Simplest)

```bash
# Start all services with full observability stack
make up

# Or without Make:
docker compose up -d --build
```

Services available at:

| Service | URL |
|---------|-----|
| Fastify API | http://localhost:3001 |
| Next.js App | http://localhost:3002 |
| FastAPI | http://localhost:8000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |
| Loki | http://localhost:3100 |

### Option 2: Kubernetes (Kind)

```bash
# Step 1: Create cluster
make kind-create

# Step 2: Build, load, and deploy
make k8s-deploy

# Step 3: Verify
make k8s-status

# Step 4: Test
make k8s-e2e
```

Access via Ingress:

| Service | URL |
|---------|-----|
| Fastify | http://localhost/fastify/api/items |
| Next.js | http://localhost/nextjs/api/products |
| FastAPI | http://localhost/fastapi/api/orders |

### Option 3: Terraform (Alternative to Helm CLI)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

This uses the Helm provider to deploy the same chart. Override variables:

```bash
terraform apply -var="image_tag=abc123" -var="fastify_replicas=3"
```

## Running Tests

### Unit Tests

```bash
make test               # All services
make test-fastify       # Fastify only
make test-nextjs        # Next.js only
make test-fastapi       # FastAPI only
```

### E2E Tests

The E2E script (`tests/e2e/run.sh`) tests all endpoints across all services:

- Health and readiness probes
- CRUD operations (GET list, GET by ID, POST create)
- Error cases (404, 400)
- Prometheus /metrics endpoint validation

```bash
make e2e                # Against Docker Compose
make k8s-e2e            # Against Kind Ingress
```

## CI/CD Pipelines

### CI (`ci.yml`) -- On push and pull request

```
lint    -> Lint all 3 services (ESLint / ruff)
test    -> Run unit tests for all 3 services
build   -> Build Docker images
scan    -> Trivy vulnerability scan (HIGH, CRITICAL)
e2e     -> Docker Compose E2E tests
```

Each job uses a matrix strategy to run services in parallel.

### CD (`deploy.yml`) -- On push to main

```
build-and-push    -> Build images tagged with git SHA, push to ghcr.io
update-manifests  -> Update Helm values.yaml with new image tags
```

Images are pushed to `ghcr.io/<owner>/<service>:<git-sha>` and `:latest`.

## Service Endpoints

### fastify-service (:3001)

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness probe |
| GET | /ready | Readiness probe |
| GET | /metrics | Prometheus metrics |
| GET | /api/items | List items |
| GET | /api/items/:id | Get item by ID |
| POST | /api/items | Create item `{"name":"...","description":"..."}` |

### nextjs-service (:3002)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Liveness probe |
| GET | /api/ready | Readiness probe |
| GET | /api/metrics | Prometheus metrics |
| GET | /api/products | List products |
| GET | /api/products/[id] | Get product by ID |
| POST | /api/products | Create product `{"name":"...","price":9.99,"category":"..."}` |
| GET | / | Dashboard page |

### fastapi-service (:8000)

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness probe |
| GET | /ready | Readiness probe |
| GET | /metrics | Prometheus metrics |
| GET | /api/orders | List orders |
| GET | /api/orders/{id} | Get order by ID |
| POST | /api/orders | Create order `{"customer":"...","item":"...","quantity":1}` |

## Observability

### OpenTelemetry

All services export traces via OTLP HTTP to the OpenTelemetry Collector. The collector is configured with:
- **Receiver**: OTLP HTTP on port 4318
- **Processor**: Batch (5s timeout, 1024 batch size)
- **Exporters**: Debug (stdout) and Prometheus (port 8889)

### Prometheus

Each service exposes a `/metrics` endpoint. Prometheus scrapes all services + the OTel Collector every 15 seconds.

### Loki + Fluent Bit

Docker container logs are forwarded via the Fluentd log driver to Fluent Bit (port 24224), which pushes them to Loki. Query logs in Grafana using the Loki datasource.

### Grafana

Pre-configured with both Prometheus and Loki datasources. Access at http://localhost:3000 (admin/admin).

## KEDA (Optional)

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda --create-namespace
kubectl apply -f k8s/keda/scaled-objects.yaml
```

## Cleanup

```bash
make down           # Stop Docker Compose
make k8s-delete     # Remove from Kind
make kind-delete    # Delete Kind cluster
make clean          # Remove build artifacts
```

## Troubleshooting

### Port 80 already in use (Windows)
```powershell
netstat -ano | findstr :80
# Stop the conflicting process or change Kind port mappings in scripts/kind-config.yaml
```

### Docker Compose fluentd driver error
If services fail to start with "fluentd driver not found", ensure Fluent Bit starts first:
```bash
docker compose up -d fluent-bit
docker compose up -d
```

### Kind images not found
Ensure images are loaded into Kind after building:
```bash
make kind-load
```

### Terraform state
Terraform state is stored locally in `terraform/terraform.tfstate`. Do not commit this file (it is gitignored).

## macOS Notes

- Install prerequisites via Homebrew: `brew install kind kubectl helm node python@3.12 trivy terraform`
- Docker Desktop for Mac must be running
- Port 80 may require `sudo`. Check with `lsof -i :80`
- All shell scripts and Makefile targets are cross-platform (bash)
- GNU Make is pre-installed on macOS

## License

See [LICENSE](LICENSE) file.
