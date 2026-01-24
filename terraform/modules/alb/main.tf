variable "env" { type = string }
variable "app_name" { type = string }
variable "vpc_id" { type = string }
variable "public_subnets" { type = list(string) }

# 1. Security Group para el Load Balancer (Abierto al mundo)
resource "aws_security_group" "alb_sg" {
  name        = "${var.app_name}-alb-sg-${var.env}"
  description = "Security Group for ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. El Load Balancer (Application Load Balancer)
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb-${var.env}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnets

  enable_deletion_protection = false
}

# 3. Listener (Escucha el puerto 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  # Acción por defecto: Devolver un 404 si no encuentra ruta
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: Not Found - EMR System (ALB Ready)"
      status_code  = "404"
    }
  }
}

# Outputs para conectar con el Cluster ECS
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_security_group_id" {
  value = aws_security_group.alb_sg.id
}

output "listener_arn" {
  value = aws_lb_listener.http.arn
}