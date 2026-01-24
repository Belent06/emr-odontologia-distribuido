output "rds_endpoint" {
  value = module.database.db_endpoint
}

output "bastion_ip" {
  value = module.compute.bastion_public_ip
}

output "s3_bucket" {
  value = module.database.s3_bucket_name
}