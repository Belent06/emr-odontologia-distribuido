# ============================================
# URLs Y ENDPOINTS
# ============================================
output "alb_dns_name" {
  description = "DNS del Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "application_url" {
  description = "URL principal de la aplicación"
  value       = "http://${aws_lb.main.dns_name}"
}

output "service_endpoints" {
  description = "Endpoints de cada microservicio"
  value = {
    for key, config in var.microservices : key => {
      url          = "http://${aws_lb.main.dns_name}${config.path_pattern[0]}"
      health_check = "http://${aws_lb.main.dns_name}${config.health_path}"
      internal_dns = key != "emr-frontend" ? "${key}.emr.local" : null
    }
  }
}

# ============================================
# INFORMACIÓN DE RECURSOS
# ============================================
output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN del cluster ECS"
  value       = aws_ecs_cluster.main.arn
}

output "ecr_repositories" {
  description = "URLs de repositorios ECR"
  value = {
    for key, repo in data.aws_ecr_repository.services : key => repo.repository_url
  }
}

output "vpc_id" {
  description = "ID de la VPC"
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "IDs de subnets públicas"
  value       = aws_subnet.public[*].id
}

# ============================================
# INFORMACIÓN PARA DEBUGGING
# ============================================
output "services_status" {
  description = "Estado de los servicios desplegados"
  value = {
    for key, service in aws_ecs_service.services : key => {
      desired_count = service.desired_count
      task_family   = aws_ecs_task_definition.services[key].family
      target_group  = aws_lb_target_group.services[key].name
    }
  }
}

# ============================================
# COMANDOS ÚTILES
# ============================================
output "useful_commands" {
  description = "Comandos útiles para gestionar el despliegue"
  value = <<-EOT

    # Ver logs de un servicio
    aws logs tail /ecs/emr-system/api-gateway --follow

    # Forzar nuevo despliegue de un servicio
    aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service api-gateway --force-new-deployment

    # Ver tareas en ejecución
    aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name}

    # Escalar un servicio
    aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service api-gateway --desired-count 2

  EOT
}