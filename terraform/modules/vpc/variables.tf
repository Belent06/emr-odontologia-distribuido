# terraform/modules/vpc/variables.tf

variable "project_name" {
  description = "Nombre del proyecto (ej. emr-odonto)"
  type        = string
}

variable "environment" {
  description = "Entorno de despliegue (qa, prod)"
  type        = string
}

variable "aws_region" {
  description = "Región de AWS (ej. us-east-1)"
  type        = string
}

variable "vpc_cidr" {
  description = "Rango IP de la VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "Rango IP Subred Publica"
  type        = string
}

variable "private_subnet_cidr" {
  description = "Rango IP Subred Privada"
  type        = string
}