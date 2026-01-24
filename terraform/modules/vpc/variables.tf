variable "env" {
  description = "Entorno (qa, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "Rango de IP para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Lista de rangos IP para subnets publicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "Lista de rangos IP para subnets privadas"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}