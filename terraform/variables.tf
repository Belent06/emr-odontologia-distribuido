# ============================================
# CONFIGURACIÓN AWS ACADEMY
# ============================================
variable "aws_region" {
  description = "Región AWS (obligatorio us-east-1 para Academy)"
  type        = string
  default     = "us-east-1"
}

variable "lab_role_arn" {
  description = "ARN del LabRole de AWS Academy - NO CREAR ROLES NUEVOS"
  type        = string
  # Formato típico: arn:aws:iam::ACCOUNT_ID:role/LabRole
}

variable "environment" {
  description = "Ambiente de despliegue"
  type        = string
  default     = "dev"
}

# ============================================
# DEFINICIÓN DE MICROSERVICIOS (DRY)
# ============================================
variable "microservices" {
  description = "Mapa de microservicios a desplegar"
  type = map(object({
    port           = number
    cpu            = number
    memory         = number
    desired_count  = number
    health_path    = string
    path_pattern   = list(string)
    priority       = number
    is_frontend    = bool
  }))

  default = {
    "api-gateway" = {
      port          = 3000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_path   = "/health"
      path_pattern  = ["/api/*", "/api"]
      priority      = 100
      is_frontend   = false
    }
    "svc-appointments" = {
      port          = 3000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_path   = "/health"
      path_pattern  = ["/appointments/*", "/appointments"]
      priority      = 200
      is_frontend   = false
    }
    "svc-audit" = {
      port          = 3000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_path   = "/health"
      path_pattern  = ["/audit/*", "/audit"]
      priority      = 300
      is_frontend   = false
    }
    "svc-auth" = {
      port          = 3000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_path   = "/health"
      path_pattern  = ["/auth/*", "/auth"]
      priority      = 400
      is_frontend   = false
    }
    "emr-frontend" = {
      port          = 80
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_path   = "/"
      path_pattern  = ["/*"]
      priority      = 999  # Última prioridad (catch-all)
      is_frontend   = true
    }
  }
}

# ============================================
# NETWORKING
# ============================================
variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidad"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs para subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}