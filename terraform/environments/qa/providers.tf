terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Región estándar de AWS Academy (Norte de Virginia)

  default_tags {
    tags = {
      Environment = "qa"
      Project     = "emr-odontologia"
      ManagedBy   = "terraform"
      Student     = "TuNombre" # Cambia esto si quieres
    }
  }
}