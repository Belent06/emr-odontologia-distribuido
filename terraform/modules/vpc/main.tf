# 1. Crear la VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "emr-vpc-${var.env}"
  }
}

# 2. Obtener Zonas de Disponibilidad (us-east-1a, us-east-1b)
data "aws_availability_zones" "available" {
  state = "available"
}

# 3. Crear Subnets Públicas (Para Load Balancer y Bastion)
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "emr-public-subnet-${var.env}-${count.index + 1}"
  }
}

# 4. Crear Subnets Privadas (Para Microservicios y Bases de Datos)
resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "emr-private-subnet-${var.env}-${count.index + 1}"
  }
}

# 5. Internet Gateway (Puerta al mundo para lo público)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "emr-igw-${var.env}"
  }
}

# 6. Tabla de Rutas Pública
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "emr-public-rt-${var.env}"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# 7. NAT Gateway (Para que los privados tengan internet de salida seguro)
# Necesitamos una Elastic IP para el NAT
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # Se pone en la pública

  tags = {
    Name = "emr-nat-gw-${var.env}"
  }
  depends_on = [aws_internet_gateway.igw]
}

# 8. Tabla de Rutas Privada
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "emr-private-rt-${var.env}"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}