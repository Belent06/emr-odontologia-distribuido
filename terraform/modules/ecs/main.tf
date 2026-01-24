variable "env" { type = string }
variable "app_name" { type = string }

# 1. El Cluster ECS (Agrupador lógico)
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster-${var.env}"
}

# 2. Grupo de Logs en CloudWatch
resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/${var.app_name}-${var.env}"
  retention_in_days = 1 # En Academy borramos logs rápido para no llenar espacio
}

output "cluster_id" {
  value = aws_ecs_cluster.main.id
}