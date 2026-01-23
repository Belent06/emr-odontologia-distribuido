module "vpc_qa" {
  # REFERENCIA RELATIVA: Sube dos niveles y entra a modules/vpc
  source = "../../modules/vpc"

  # VARIABLES: Aquí definimos la "personalidad" de este entorno
  project_name        = "emr-odonto"
  environment         = "qa"
  aws_region          = "us-east-1"
  
  # REDES:
  vpc_cidr            = "10.0.0.0/16"      # Red grande para QA
  public_subnet_cidr  = "10.0.1.0/24"      # Para Bastion/ALB
  private_subnet_cidr = "10.0.2.0/24"      # Para tus Microservicios
}

# OUTPUTS: Para ver los IDs en la consola después de crear
output "qa_vpc_id" {
  value = module.vpc_qa.vpc_id
}