variable "env" { type = string }
variable "vpc_id" { type = string }
variable "public_subnets" { type = list(string) }
variable "key_name" { 
  type = string 
  description = "Nombre del Key Pair creado en AWS"
}