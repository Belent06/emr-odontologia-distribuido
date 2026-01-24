#!/bin/bash
# filepath: build_and_push.sh

set -e

# ============================================
# CONFIGURACIÓN - AWS Academy Learner Lab
# ============================================
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Lista de microservicios (excluye carpetas e2e)
MICROSERVICES=(
    "api-gateway"
    "svc-appointments"
    "svc-audit"
    "svc-auth"
    "emr-frontend"
)

# ============================================
# FUNCIONES
# ============================================
log_info() {
    echo -e "\n\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
    exit 1
}

# ============================================
# LOGIN A ECR
# ============================================
log_info "Iniciando sesión en Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}

log_success "Login exitoso en ECR"

# ============================================
# CREAR REPOSITORIOS SI NO EXISTEN
# ============================================
log_info "Verificando/creando repositorios ECR..."

for service in "${MICROSERVICES[@]}"; do
    REPO_NAME="emr-system/${service}"
    
    if aws ecr describe-repositories --repository-names "${REPO_NAME}" --region ${AWS_REGION} 2>/dev/null; then
        log_info "Repositorio ${REPO_NAME} ya existe"
    else
        log_info "Creando repositorio ${REPO_NAME}..."
        aws ecr create-repository \
            --repository-name "${REPO_NAME}" \
            --region ${AWS_REGION} \
            --image-scanning-configuration scanOnPush=true
        log_success "Repositorio ${REPO_NAME} creado"
    fi
done

# ============================================
# BUILD Y PUSH DE IMÁGENES
# ============================================
IMAGE_TAG="${IMAGE_TAG:-latest}"
BUILD_DATE=$(date +%Y%m%d-%H%M%S)

log_info "Iniciando build de imágenes con tag: ${IMAGE_TAG}"

for service in "${MICROSERVICES[@]}"; do
    log_info "=========================================="
    log_info "Procesando: ${service}"
    log_info "=========================================="
    
    DOCKERFILE_PATH="apps/${service}/Dockerfile"
    REPO_NAME="emr-system/${service}"
    FULL_IMAGE_NAME="${ECR_REGISTRY}/${REPO_NAME}"
    
    # Verificar que existe el Dockerfile
    if [ ! -f "${DOCKERFILE_PATH}" ]; then
        log_error "No se encontró Dockerfile en ${DOCKERFILE_PATH}"
    fi
    
    # Build de la imagen (desde la raíz del monorepo)
    log_info "Building ${service}..."
    docker build \
        -t "${FULL_IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${FULL_IMAGE_NAME}:${BUILD_DATE}" \
        -f "${DOCKERFILE_PATH}" \
        .
    
    # Push de las imágenes
    log_info "Pushing ${service} a ECR..."
    docker push "${FULL_IMAGE_NAME}:${IMAGE_TAG}"
    docker push "${FULL_IMAGE_NAME}:${BUILD_DATE}"
    
    log_success "${service} subido exitosamente"
done

# ============================================
# RESUMEN
# ============================================
echo ""
echo "============================================"
echo "           RESUMEN DEL DESPLIEGUE          "
echo "============================================"
echo ""
for service in "${MICROSERVICES[@]}"; do
    echo "  ✅ ${ECR_REGISTRY}/emr-system/${service}:${IMAGE_TAG}"
done
echo ""
echo "Tag de fecha: ${BUILD_DATE}"
echo "============================================"