output "db_endpoint" {
  value = aws_db_instance.postgres.address
}

output "s3_bucket_name" {
  value = aws_s3_bucket.files.bucket
}

output "dynamo_audit_name" {
  value = aws_dynamodb_table.audit.name
}