# 1. SECURITY GROUP (El Portero)
# Permite tráfico en el puerto 5432 (Postgres) solo desde dentro de la VPC
resource "aws_security_group" "rds_sg" {
  name        = "emr-rds-sg-${var.env}"
  description = "Allow Postgres inbound traffic"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr] # Solo permite IPs de nuestra red
  }

  tags = { Name = "emr-rds-sg-${var.env}" }
}

# 2. SUBNET GROUP
# Le dice a RDS: "Solo puedes vivir en estas subnets privadas"
resource "aws_db_subnet_group" "main" {
  name       = "emr-db-subnet-group-${var.env}"
  subnet_ids = var.private_subnets

  tags = { Name = "emr-db-subnet-group-${var.env}" }
}

# 3. RDS INSTANCE (El Servidor Postgres)
resource "aws_db_instance" "postgres" {
  identifier           = "emr-postgres-${var.env}"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "16.6" # Versión estable
  instance_class       = "db.t3.micro" # Capa gratuita / barata
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  skip_final_snapshot    = true # Importante para laboratorios
  publicly_accessible    = false # Seguridad: NO accesible desde internet
  multi_az               = false # Ahorro de costos para Academy
}

# 4. DYNAMODB (Para Auditoría e Historial)
resource "aws_dynamodb_table" "audit" {
  name           = "AuditLogs"
  billing_mode   = "PAY_PER_REQUEST" # Serverless (Barato)
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S" # String
  }

  tags = { Name = "AuditLogs-${var.env}" }
}

resource "aws_dynamodb_table" "history" {
  name           = "emr-history-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

  tags = { Name = "emr-history-table-${var.env}" }
}

# 5. S3 BUCKET (Para svc-files)
# Generamos un ID random porque los nombres de S3 deben ser únicos MUNDIALMENTE
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "files" {
  bucket = "emr-files-${var.env}-${random_id.bucket_suffix.hex}"
  force_destroy = true # Permite borrar el bucket aunque tenga archivos (útil para labs)
  
  tags = { Name = "emr-files-bucket" }
}