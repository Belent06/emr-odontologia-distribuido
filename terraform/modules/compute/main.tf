# 1. SECURITY GROUP para el Bastion
# Permite entrar por SSH (Puerto 22) desde cualquier lugar (0.0.0.0/0)
# En un entorno real, restringiríamos esto a tu IP personal.
resource "aws_security_group" "bastion_sg" {
  name        = "emr-bastion-sg-${var.env}"
  description = "Allow SSH access"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "emr-bastion-sg-${var.env}" }
}

# 2. BUSCAR LA IMAGEN (AMI) MÁS RECIENTE DE AMAZON LINUX 2023
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# 3. CREAR EL SERVIDOR BASTION (EC2)
resource "aws_instance" "bastion" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro" # Capa gratuita
  subnet_id     = var.public_subnets[0] # Primera subnet pública
  
  key_name      = var.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  associate_public_ip_address = true # IMPORTANTE: Necesita IP pública

  tags = {
    Name = "emr-bastion-${var.env}"
    Role = "Bastion"
  }
}