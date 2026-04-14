{{/*
Common labels
*/}}
{{- define "deploy-services.labels" -}}
app.kubernetes.io/part-of: deploy-services
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{/*
Service labels
*/}}
{{- define "deploy-services.svcLabels" -}}
app: {{ .name }}
{{ include "deploy-services.labels" .context }}
{{- end }}
