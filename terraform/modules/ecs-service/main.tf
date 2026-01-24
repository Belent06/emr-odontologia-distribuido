variable "app_name" {}
variable "env" {}
variable "service_name" {} # Ej: svc-auth
variable "image_url" {}    # URL del ECR
variable "container_port" { default = 3000 }
variable "host_port" { default = 3000 }
variable "cpu" { default = 256 }    # .25 vCPU (Capa gratuita friendly)
variable "memory" { default = 512 } # 512 MB

# Variables de Red e Infra
variable "vpc_id" {}
variable "cluster_id" {}
variable "private_subnets" { type = list(string) }
variable "alb_listener_arn" {}
variable "alb_security_group_id" {}
variable "execution_role_arn" {} # Rol para bajar imagen
variable "task_role_arn" {}      # Rol para que el container use AWS Services

# Variables de Entorno (DB_HOST, PASS, etc)
variable "env_vars" {
  type = map(string)
  default = {}
}

# Ruta para el Load Balancer (Ej: /api/auth*)
variable "path_pattern" { type = list(string) }

# 1. Target Group (El grupo de contenedores)
resource "aws_lb_target_group" "main" {
  name        = "${var.service_name}-tg-${var.env}"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Necesario para Fargate

  health_check {
    path                = "/api" # NestJS suele responder 404 o 200 aqui, ajustaremos si falla
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200,404,401" # Aceptamos estos codigos como "vivo"
  }
}

# 2. Listener Rule (La regla de tráfico: Si viene X, manda a Y)
resource "aws_lb_listener_rule" "main" {
  listener_arn = var.alb_listener_arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  condition {
    path_pattern {
      values = var.path_pattern
    }
  }
}

# 3. Security Group del Servicio (Solo acepta tráfico del ALB)
resource "aws_security_group" "ecs_sg" {
  name        = "${var.service_name}-ecs-sg-${var.env}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id] # Solo el ALB puede entrar
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # El container puede salir a internet (bajar imagen, hablar con RDS)
  }
}

# 4. Task Definition (El plano del contenedor)
resource "aws_ecs_task_definition" "main" {
  family                   = "${var.service_name}-${var.env}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = var.service_name
    image     = var.image_url
    essential = true
    portMappings = [{
      containerPort = var.container_port
      hostPort      = var.host_port
    }]
    
    # Aquí inyectamos las variables de entorno para SOBREESCRIBIR tu localhost
    environment = [
      for key, value in var.env_vars : {
        name  = key
        value = value
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/emr-${var.env}"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = var.service_name
      }
    }
  }])
}

# 5. ECS Service (El ejecutor)
resource "aws_ecs_service" "main" {
  name            = "${var.service_name}-${var.env}"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.main.arn
  launch_type     = "FARGATE"
  desired_count   = 1 # Solo 1 copia para ahorrar dinero en Academy

  network_configuration {
    subnets          = var.private_subnets # Contenedores en subred privada (Seguro)
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = false # Salen a internet via NAT Gateway
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.service_name
    container_port   = var.container_port
  }
}