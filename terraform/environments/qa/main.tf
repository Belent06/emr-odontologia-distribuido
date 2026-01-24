module "vpc" {
  source = "../../modules/vpc"

  env             = "qa"
  vpc_cidr        = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]
}

module "database" {
  source = "../../modules/database"

  env             = "qa"
  vpc_id          = module.vpc.vpc_id
  vpc_cidr        = "10.0.0.0/16"
  private_subnets = module.vpc.private_subnets
  
  # Credenciales de BD
  db_name     = "postgres" 
  db_username = "postgres"
  db_password = "PasswordSeguro123!" 
}

# Módulo de Cómputo (Bastion Host)
module "compute" {
  source = "../../modules/compute"

  env            = "qa"
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
  
  key_name       = "emr-key" 
}

# Módulo ECR (Garaje de Imágenes Docker)
module "ecr" {
  source        = "../../modules/ecr"

  project_name  = "emr"
  env           = "qa"
  
  # Lista de servicios que necesitan repositorio
  service_names = ["svc-auth", "svc-patients", "svc-files"]
}

# Módulo IAM (Busca el LabRole para Academy)
module "iam" {
  source   = "../../modules/iam"
  app_name = "emr"
  env      = "qa"
}

# Módulo ALB (Load Balancer - La Puerta de Entrada)
module "alb" {
  source         = "../../modules/alb"
  app_name       = "emr"
  env            = "qa"
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}

# Módulo ECS (El Clúster - El Cerebro)
module "ecs" {
  source   = "../../modules/ecs"
  app_name = "emr"
  env      = "qa"
}

# ===========================================================
# 🚀 MICROSERVICIOS
# ===========================================================

# 1. SERVICIO DE AUTENTICACIÓN (SVC-AUTH)
module "svc_auth" {
  source = "../../modules/ecs-service"

  app_name     = "emr"
  env          = "qa"
  service_name = "svc-auth"
  
  image_url    = module.ecr.repository_urls["svc-auth"] 
  
  vpc_id                = module.vpc.vpc_id
  cluster_id            = module.ecs.cluster_id
  private_subnets       = module.vpc.private_subnets
  alb_listener_arn      = module.alb.listener_arn
  alb_security_group_id = module.alb.alb_security_group_id
  execution_role_arn    = module.iam.execution_role_arn
  task_role_arn         = module.iam.task_role_arn

  path_pattern = ["/api/auth*"]

  env_vars = {
    "DB_HOST"      = module.database.db_endpoint
    "DB_PORT"      = "5432"
    "DB_USERNAME"  = "postgres"
    "DB_PASSWORD"  = "PasswordSeguro123!"
    "DB_DATABASE"  = "auth_db"
    "DB_SSL"       = "true"
    "JWT_SECRET"   = "SecretSuperSeguro"
    "PORT"         = "3000"
  }
}

# 2. SERVICIO DE PACIENTES (SVC-PATIENTS)
module "svc_patients" {
  source = "../../modules/ecs-service"

  app_name     = "emr"
  env          = "qa"
  service_name = "svc-patients"
  
  image_url    = module.ecr.repository_urls["svc-patients"] 
  
  vpc_id                = module.vpc.vpc_id
  cluster_id            = module.ecs.cluster_id
  private_subnets       = module.vpc.private_subnets
  alb_listener_arn      = module.alb.listener_arn
  alb_security_group_id = module.alb.alb_security_group_id
  execution_role_arn    = module.iam.execution_role_arn
  task_role_arn         = module.iam.task_role_arn

  # Ruteo: /api/patients*
  path_pattern = ["/api/patients*"]

  env_vars = {
    "DB_HOST"      = module.database.db_endpoint
    "DB_PORT"      = "5432"
    "DB_USERNAME"  = "postgres"
    "DB_PASSWORD"  = "PasswordSeguro123!"
    "DB_DATABASE"  = "patients_db"
    "DB_SSL"       = "true"
    "PORT"         = "3000"
  }
}

# 3. SERVICIO DE ARCHIVOS (SVC-FILES)
module "svc_files" {
  source = "../../modules/ecs-service"

  app_name     = "emr"
  env          = "qa"
  service_name = "svc-files"
  
  image_url    = module.ecr.repository_urls["svc-files"] 
  
  vpc_id                = module.vpc.vpc_id
  cluster_id            = module.ecs.cluster_id
  private_subnets       = module.vpc.private_subnets
  alb_listener_arn      = module.alb.listener_arn
  alb_security_group_id = module.alb.alb_security_group_id
  execution_role_arn    = module.iam.execution_role_arn
  task_role_arn         = module.iam.task_role_arn

  # Ruteo: /api/files*
  path_pattern = ["/api/files*"]

  env_vars = {
    "DB_HOST"      = module.database.db_endpoint
    "DB_PORT"      = "5432"
    "DB_USERNAME"  = "postgres"
    "DB_PASSWORD"  = "PasswordSeguro123!"
    "DB_DATABASE"  = "files_db"
    "DB_SSL"       = "true"
    "PORT"         = "3000"
    
    # 👇 IMPORTANTE: Nombre del bucket que creaste (revisar output anterior si cambia)
    "AWS_S3_BUCKET" = "emr-files-qa-36c4acb1" 
    "AWS_REGION"    = "us-east-1"
  }
}

# -----------------------------------------------------------
# OUTPUTS
# -----------------------------------------------------------

output "ecr_repos" {
  value = module.ecr.repository_urls
}

output "alb_dns" {
  value = module.alb.alb_dns_name
}