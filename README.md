# 🦷 EMR Odontología - Sistema de Gestión Médica (Entorno Local)

![NestJS](https://img.shields.io/badge/Backend-NestJS-red)
![Nx](https://img.shields.io/badge/Monorepo-Nx-blue)
![Docker](https://img.shields.io/badge/Infra-Docker_Compose-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-yellow)

Sistema de **Expediente Médico Electrónico (EMR)** para odontología, construido bajo una arquitectura de **microservicios** utilizando un monorepo con **Nx**.
Diseñado para ser **modular, escalable y fácil de mantener**, ejecutándose completamente en un **entorno local** con Docker.

---

## 🏗️ Arquitectura del Sistema (Local)

El sistema utiliza un patrón de **API Gateway** como único punto de entrada para el cliente (Frontend).
Los microservicios se comunican mediante **REST** y **mensajería asíncrona (RabbitMQ)** para auditoría y notificaciones.

```mermaid
graph TD
    Client[Frontend / Postman] -->|HTTP Request| Gateway[API Gateway]

    subgraph "Microservicios (NestJS)"
        Gateway -->|/auth| Auth[svc-auth]
        Gateway -->|/patients| Patients[svc-patients]
        Gateway -->|/files| Files[svc-files]
        Gateway -->|/appointments| Appointments[svc-appointments]

        Files -.->|Evento Audit| RabbitMQ
        Auth -.->|Evento Audit| RabbitMQ

        RabbitMQ --> Audit[svc-audit]
        RabbitMQ --> Notifications[svc-notifications]
    end

    subgraph "Infraestructura Local (Docker)"
        Auth --> DB_PG[(Postgres Auth)]
        Patients --> DB_PG2[(Postgres Patients)]
        Patients --> Redis[(Redis Cache)]
        Audit --> Mongo[(MongoDB)]
    end
```

### 🧩 Catálogo de Servicios

El proyecto está organizado dentro de la carpeta `apps/`.

| Servicio | Tipo | Descripción | Puerto Local |
| :--- | :--- | :--- | :--- |
| **api-gateway** | Gateway | Punto de entrada. Enruta tráfico y valida JWT | `3000` |
| **svc-auth** | Microservicio | Gestión de usuarios, roles, login y registro | `3001` |
| **svc-patients** | Microservicio | CRUD de pacientes y fichas médicas (Redis Cache) | `3002` |
| **svc-appointments** | Microservicio | Gestión de citas y agenda médica | `3003` |
| **svc-files** | Microservicio | Subida y descarga de radiografías y documentos | `3004` |
| **svc-history** | Microservicio | Control de versiones de historias clínicas | `3005` |
| **svc-audit** | Worker | Auditoría y registro de eventos | N/A |
| **svc-notifications** | Worker | Envío de correos y alertas | N/A |
| **svc-backup** | Job | Respaldos automáticos de base de datos | N/A |
| **emr-frontend** | Frontend | Aplicación web para doctores y administradores | `4200` |

### 📚 Librerías Compartidas (`libs/`)

* **`shared-dtos`**: Contiene DTOs (Data Transfer Objects) e interfaces compartidas entre frontend y backend para garantizar tipado estricto y consistencia.

---

## 🛠️ Stack Tecnológico

* **Entorno de Ejecución:** Node.js v18+
* **Monorepo:** Nx
* **Lenguaje:** TypeScript
* **Backend:** NestJS
* **Bases de Datos (Docker):**
    * 🐘 **PostgreSQL:** Datos relacionales (Auth, Pacientes, Citas)
    * 🍃 **MongoDB:** Logs y Auditoría
    * 🔴 **Redis:** Caché y sesiones
* **Mensajería:** 🐰 RabbitMQ (eventos asíncronos)

---

## 🚀 Guía de Inicio Rápido

### 1️⃣ Prerrequisitos
Asegúrate de tener instalado:
* [Node.js (LTS)](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (debe estar en ejecución)
* Git

### 2️⃣ Instalación de Dependencias

```bash
npm install
```

### 3️⃣ Levantar Infraestructura (Docker)

Esto iniciará PostgreSQL, Redis, RabbitMQ y MongoDB.

```bash
docker-compose up -d
```

### 4️⃣ Configuración de Entorno (`.env`)

Crea un archivo `.env` en la raíz con las siguientes variables base:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=root

REDIS_HOST=localhost

RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### 5️⃣ Ejecutar los Microservicios

Tienes dos opciones para correr el proyecto:

**🔹 Opción A: Ejecutar todo el sistema**
```bash
npx nx run-many --target=serve --all --parallel=10
```

**🔹 Opción B: Ejecutar servicios específicos**
```bash
# API Gateway
npx nx serve api-gateway

# Servicio de Pacientes
npx nx serve svc-patients

# Frontend
npx nx serve emr-frontend
```
