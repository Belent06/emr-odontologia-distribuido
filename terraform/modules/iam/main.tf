variable "env" { type = string }
variable "app_name" { type = string }

# ENFOQUE ACADEMY: No creamos rol, buscamos el "LabRole" existente
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

output "execution_role_arn" {
  value = data.aws_iam_role.lab_role.arn
}

# También usaremos este rol para las tareas (Task Role)
output "task_role_arn" {
  value = data.aws_iam_role.lab_role.arn
}