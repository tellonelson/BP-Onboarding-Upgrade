# BP-Onboarding

Aplicacion de onboarding bancario compuesta por microservicios Spring Boot y un frontend Angular, orquestados con Docker Compose.

## Arquitectura

```
                    ┌──────────────┐
                    │   Frontend   │ :4200
                    │  Angular 21  │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Gateway    │ :8080
                    │ Spring Cloud │
                    └──────┬───────┘
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐ ┌──┴───────┐ ┌──┴──────────┐
       │  Customer   │ │ Account  │ │  Movement   │
       │   :8081     │ │  :8082   │ │   :8083     │
       └──────┬──────┘ └──┬───────┘ └──┬──────────┘
              │            │            │
              └────────────┼────────────┘
                    ┌──────┴───────┐
                    │  PostgreSQL  │ :5435
                    │     16       │
                    └──────────────┘
```

## Requisitos previos

- **Docker** y **Docker Compose**
- **Java 21** (para ejecucion local y tests del backend)
- **Node.js 20+** y **npm** (para ejecucion local y tests del frontend)

## Clonar el repositorio

```bash
git clone https://github.com/tellonelson/BP-Onboarding-Upgrade.git
cd BP-Onboarding-Upgrade
```

## Ejecucion con Docker

### Levantar toda la aplicacion

```bash
docker-compose up -d --build
```

Esto levanta todos los servicios:

| Servicio         | URL                        |
|------------------|----------------------------|
| Frontend         | http://localhost:4200       |
| Gateway          | http://localhost:8080       |
| Customer API     | http://localhost:8081       |
| Account API      | http://localhost:8082       |
| Movement API     | http://localhost:8083       |
| PostgreSQL       | localhost:5435              |

### Detener la aplicacion

```bash
docker-compose down
```

### Detener y eliminar volumenes (borra datos de BD)

```bash
docker-compose down -v
```

### Reconstruir un servicio especifico

```bash
docker-compose up --build upgrade-account
```

## Conexion a la base de datos

| Parametro    | Valor            |
|-------------|------------------|
| Host        | localhost        |
| Puerto      | 5435             |
| Base de datos| onboarding_db   |
| Usuario     | root             |
| Password    | rootpassword     |

```bash
psql -h localhost -p 5435 -U root -d onboarding_db
```

## Ejecucion de tests

### Backend - Tests unitarios (Gradle + JUnit 5)

Cada microservicio se prueba de forma independiente:

```bash
# Customer
cd backend/cig-msa-sp-onboarding-upgrade-customer
./gradlew test

# Account
cd backend/cig-msa-sp-onboarding-upgrade-account
./gradlew test

# Movement
cd backend/cig-msa-sp-onboarding-upgrade-movement
./gradlew test
```

Los reportes de cobertura (JaCoCo) se generan en `build/reports/jacoco/` de cada microservicio.

### Frontend - Tests unitarios (Jest)

```bash
cd frontend/cig-spa-sp-onboarding-upgrade
npm install
npm test
```

## Estructura del proyecto

```
BP-Onboarding/
├── docker-compose.yml
├── backend/
│   ├── cig-msa-sp-onboarding-gateway/          # API Gateway
│   ├── cig-msa-sp-onboarding-upgrade-customer/  # Microservicio de Clientes
│   ├── cig-msa-sp-onboarding-upgrade-account/   # Microservicio de Cuentas
│   └── cig-msa-sp-onboarding-upgrade-movement/  # Microservicio de Movimientos
└── frontend/
    └── cig-spa-sp-onboarding-upgrade/           # SPA Angular
```

## Tecnologias y librerias

### Gateway (`cig-msa-sp-onboarding-gateway`)

| Libreria | Descripcion |
|----------|-------------|
| Spring Boot 3.5.11 | Framework base |
| Spring Cloud Gateway Server WebMVC | Enrutamiento de peticiones a microservicios |
| Spring Cloud 2025.0.1 | BOM de dependencias cloud |
| Spring Boot Actuator | Endpoints de monitoreo y health checks |
| Lombok | Generacion de codigo boilerplate |
| Java 21 | Version del JDK |

### Customer (`cig-msa-sp-onboarding-upgrade-customer`)

| Libreria | Descripcion |
|----------|-------------|
| Spring Boot 3.5.11 | Framework base |
| Spring Data JPA | Persistencia y acceso a datos |
| Spring Web | API REST |
| Spring Validation | Validacion de DTOs con Jakarta Validation |
| PostgreSQL Driver | Conexion a base de datos |
| Lombok | Generacion de codigo boilerplate |
| JUnit 5 + Mockito | Testing unitario |
| JaCoCo 0.8.12 | Cobertura de codigo (minimo 80%) |
| Java 21 | Version del JDK |

### Account (`cig-msa-sp-onboarding-upgrade-account`)

| Libreria | Descripcion |
|----------|-------------|
| Spring Boot 3.5.11 | Framework base |
| Spring Data JPA | Persistencia y acceso a datos |
| Spring Web | API REST |
| Spring Validation | Validacion de DTOs con Jakarta Validation |
| Spring Cloud OpenFeign | Cliente HTTP declarativo para comunicacion con Customer |
| Spring Cloud 2025.0.0 | BOM de dependencias cloud |
| PostgreSQL Driver | Conexion a base de datos |
| Lombok | Generacion de codigo boilerplate |
| JUnit 5 + Mockito | Testing unitario |
| JaCoCo 0.8.12 | Cobertura de codigo (minimo 80%) |
| Java 21 | Version del JDK |

### Movement (`cig-msa-sp-onboarding-upgrade-movement`)

| Libreria | Descripcion |
|----------|-------------|
| Spring Boot 3.5.11 | Framework base |
| Spring Data JPA | Persistencia y acceso a datos |
| Spring Web | API REST |
| Spring Validation | Validacion de DTOs con Jakarta Validation |
| Spring Cloud OpenFeign | Cliente HTTP declarativo para comunicacion con Account |
| Spring Cloud 2025.0.0 | BOM de dependencias cloud |
| PostgreSQL Driver | Conexion a base de datos |
| Lombok | Generacion de codigo boilerplate |
| JUnit 5 + Mockito | Testing unitario |
| JaCoCo 0.8.12 | Cobertura de codigo (minimo 80%) |
| Java 21 | Version del JDK |

### Frontend (`cig-spa-sp-onboarding-upgrade`)

| Libreria | Version | Descripcion |
|----------|---------|-------------|
| Angular | 21.1.0 | Framework SPA (standalone components, Signals) |
| TypeScript | 5.9.2 | Lenguaje |
| RxJS | 7.8.x | Programacion reactiva |
| Tailwind CSS | 4.1.12 | Framework de utilidades CSS |
| jsPDF | 4.2.0 | Generacion de PDFs |
| jspdf-autotable | 5.0.7 | Tablas en PDFs |
| Jest | 30.0.0 | Framework de testing |
| jest-preset-angular | 16.1.1 | Preset de Jest para Angular |
| Nginx | (Docker) | Servidor web en produccion |

## API Endpoints principales

### Clientes (`/clientes`)
- `GET /clientes` - Listar todos
- `GET /clientes/{id}` - Obtener por ID
- `POST /clientes` - Crear
- `PUT /clientes/{id}` - Actualizar
- `DELETE /clientes/{id}` - Eliminar

### Cuentas (`/cuentas`)
- `GET /cuentas` - Listar todas
- `GET /cuentas/{id}` - Obtener por ID
- `POST /cuentas` - Crear
- `PUT /cuentas/{id}` - Actualizar
- `DELETE /cuentas/{id}` - Eliminar

### Movimientos (`/movimientos`)
- `GET /movimientos` - Listar todos
- `GET /movimientos/{id}` - Obtener por ID
- `POST /movimientos` - Crear
- `PUT /movimientos/{id}` - Actualizar
- `DELETE /movimientos/{id}` - Eliminar
- `GET /movimientos/estado-cuenta` - Estado de cuenta de todas las cuentas
- `GET /movimientos/estado-cuenta/{cuentaId}` - Estado de cuenta por ID

## Reglas de negocio

- No se pueden crear cuentas para clientes inactivos
- No se pueden registrar movimientos en cuentas inactivas
- No se pueden registrar movimientos para clientes inactivos
- Los debitos no pueden dejar el saldo por debajo de cero
- Al "eliminar" una cuenta desde el frontend, se desactiva (soft delete) cambiando su estado a `false`
