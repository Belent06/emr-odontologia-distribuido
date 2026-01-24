# terraform/modules/ecr/main.tf

variable "project_name" { type = string }
variable "env" { type = string }
variable "service_names" { type = list(string) }

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.service_names)
  
  # Nombre del repo: ej. emr-svc-auth-qa
  name = "${var.project_name}-${each.key}-${var.env}" 
  
  # Permite destruir el repo aunque tenga imágenes (Ideal para pruebas/Academy)
  force_delete = true 

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "repository_urls" {
  value = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}