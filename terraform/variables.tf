variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kubeconfig_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "kind-deploy-services"
}

variable "namespace" {
  description = "Kubernetes namespace for the services"
  type        = string
  default     = "deploy-services"
}

variable "helm_chart_path" {
  description = "Path to the local Helm chart"
  type        = string
  default     = "../helm/deploy-services"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "fastify_replicas" {
  description = "Replica count for fastify-service"
  type        = number
  default     = 2
}

variable "nextjs_replicas" {
  description = "Replica count for nextjs-service"
  type        = number
  default     = 2
}

variable "fastapi_replicas" {
  description = "Replica count for fastapi-service"
  type        = number
  default     = 2
}
