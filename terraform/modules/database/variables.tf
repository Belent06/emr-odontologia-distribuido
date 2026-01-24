variable "env" { type = string }
variable "vpc_id" { type = string }
variable "private_subnets" { type = list(string) }
variable "vpc_cidr" { type = string }

# Configuración de BD
variable "db_name" { 
  type = string 
  default = "postgres" # Nombre inicial por defecto
}
variable "db_username" { type = string }
variable "db_password" { type = string }