# ============================================
# DATA SOURCES
# ============================================
data "aws_caller_identity" "current" {}

data "aws_ecr_repository" "services" {
  for_each = var.microservices
  name     = "emr-system/${each.key}"
}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  ecr_registry = "${local.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
  
  # Separar backend y frontend
  backend_services = {
    for k, v in var.microservices : k => v if !v.is_frontend
  }
  frontend_services = {
    for k, v in var.microservices : k => v if v.is_frontend
  }
}

# ============================================
# VPC Y NETWORKING (PÚBLICO - SIN NAT)
# ============================================
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "emr-system-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "emr-system-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "emr-system-public-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "emr-system-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ============================================
# SECURITY GROUPS
# ============================================
resource "aws_security_group" "alb" {
  name        = "emr-system-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "emr-system-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "emr-system-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Comunicación entre servicios
  ingress {
    description = "Inter-service communication"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "emr-system-ecs-tasks-sg"
  }
}

# ============================================
# APPLICATION LOAD BALANCER
# ============================================
resource "aws_lb" "main" {
  name               = "emr-system-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "emr-system-alb"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "EMR System - No route matched"
      status_code  = "404"
    }
  }
}

# ============================================
# TARGET GROUPS (for_each)
# ============================================
resource "aws_lb_target_group" "services" {
  for_each = var.microservices

  name        = "emr-${substr(each.key, 0, 20)}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = each.value.health_path
    matcher             = "200-299"
  }

  tags = {
    Name    = "emr-${each.key}-tg"
    Service = each.key
  }
}

# ============================================
# LISTENER RULES (Path-based routing)
# ============================================
resource "aws_lb_listener_rule" "services" {
  for_each = var.microservices

  listener_arn = aws_lb_listener.http.arn
  priority     = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = each.value.path_pattern
    }
  }

  tags = {
    Service = each.key
  }
}

# ============================================
# ECS CLUSTER
# ============================================
resource "aws_ecs_cluster" "main" {
  name = "emr-system-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"  # Ahorro de costes en Academy
  }

  tags = {
    Name = "emr-system-cluster"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"  # Ahorro ~70%
    weight            = 1
  }
}

# ============================================
# CLOUDWATCH LOG GROUPS
# ============================================
resource "aws_cloudwatch_log_group" "services" {
  for_each = var.microservices

  name              = "/ecs/emr-system/${each.key}"
  retention_in_days = 1  # Mínimo para ahorro

  tags = {
    Service = each.key
  }
}

# ============================================
# ECS TASK DEFINITIONS (for_each)
# ============================================
resource "aws_ecs_task_definition" "services" {
  for_each = var.microservices

  family                   = "emr-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  
  # ⚠️ AWS ACADEMY: Usar LabRole existente
  execution_role_arn       = var.lab_role_arn
  task_role_arn            = var.lab_role_arn

  container_definitions = jsonencode([
    {
      name      = each.key
      image     = "${local.ecr_registry}/emr-system/${each.key}:latest"
      essential = true

      portMappings = [
        {
          containerPort = each.value.port
          hostPort      = each.value.port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = tostring(each.value.port)
        },
        {
          name  = "SERVICE_NAME"
          value = each.key
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services[each.key].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -q --spider http://localhost:${each.value.port}${each.value.health_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Service = each.key
  }
}

# ============================================
# ECS SERVICES (for_each)
# ============================================
resource "aws_ecs_service" "services" {
  for_each = var.microservices

  name            = each.key
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = each.value.desired_count
  launch_type     = "FARGATE"

  # ⚠️ AWS ACADEMY: IP pública obligatoria (sin NAT)
  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  # Permite despliegues sin downtime
  
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 50
  

  # Ignorar cambios en desired_count (para auto-scaling manual)
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener_rule.services]

  tags = {
    Service = each.key
  }
}
