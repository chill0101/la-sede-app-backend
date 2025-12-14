# LA SEDE APP - Backend

API REST para la gestión de cuotas y actividades de un club deportivo. Desarrollada con Node.js, Express, Sequelize y MySQL.

![La Sede App](https://res.cloudinary.com/dsbjzd18p/image/upload/v1763340698/la-sede-app_s7qwmx.png)

## Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Autenticación y Seguridad](#autenticación-y-seguridad)

## Tecnologías

- **Node.js**
- **Express**
- **Sequelize**
- **MySQL**
- **JWT (JsonWebToken)**
- **Bcryptjs**
- **Multer**
- **Cloudinary**
- **CORS**
- **dotenv**

## Requisitos Previos

Antes de comenzar hay que tener instalado:

- **Node.js**
- **MySQL**
- **Git**
- **Cuenta en Cloudinary**

## Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd la-sede-app/backend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar la Base de Datos MySQL

#### Opción A: Usando XAMPP (Recomendado)

1. Inicia **XAMPP** y arranca los servicios de **Apache** y **MySQL**
2. Abre **phpMyAdmin** en tu navegador: `http://localhost/phpmyadmin`
3. Crea una nueva base de datos llamada `la_sede_db`:
   - Click en "Nueva" en el panel izquierdo
   - Nombre: `la_sede_db`
   - Cotejamiento: `utf8mb4_general_ci`
   - Click en "Crear"

#### Opción B: Usando MySQL desde la Terminal

```bash
mysql -u root -p
```

Luego ejecuta:

```sql
CREATE DATABASE la_sede_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;
```

### Paso 4: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales:

```env
# Configuración de Base de Datos MySQL
DB_NAME=la_sede_db
DB_USER=root
DB_PASS=
DB_HOST=localhost

# Clave secreta para JWT (puedes usar cualquier string aleatorio)
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# Credenciales de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 5: Poblar la Base de Datos con Datos de Prueba

Ejecuta el script de seed para crear las tablas y poblar la base de datos con datos iniciales:

```bash
npm run seed
```

Este comando:
- ✅ Crea todas las tablas necesarias (Usuarios, Canchas, Clases, Partidos, Reservas, Entradas, Inscripciones)
- ✅ Inserta usuarios de prueba con contraseñas hasheadas correctamente
- ✅ Carga datos de ejemplo (canchas, clases, partidos)

**Usuarios de prueba creados:**

| Email | Password | Rol |
|-------|----------|-----|
| `admin@aj.com` | `admin` | admin |
| `socio@aj.com` | `socio` | user |

### Paso 6: Iniciar el Servidor

```bash
npm start
```

Si todo está configurado correctamente, deberías ver:

```
Conexión a la base de datos establecida correctamente.
Servidor corriendo en http://localhost:3000
```

### Paso 7: Verificar que Funciona

Abre tu navegador o Postman y visita:

```
http://localhost:3000
```

Deberías ver:

```json
{
  "message": "API Backend La Sede funcionando"
}
```

## Estructura del Proyecto

```
backend
├── middleware
├── models
├── routes
├── scripts
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |

### Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/usuarios` | Listar todos los usuarios | Admin |
| PUT | `/api/usuarios/:id` | Actualizar perfil de usuario | Sí |
| POST | `/api/upload` | Subir foto de perfil | Sí |
| POST | `/api/pagos` | Registrar pago de cuota | Sí |

### Canchas y Reservas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/canchas` | Listar canchas disponibles | Sí |
| POST | `/api/reservas` | Crear nueva reserva | Sí |
| GET | `/api/reservas` | Listar todas las reservas | Sí |

### Clases

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/clases` | Listar clases disponibles | Sí |
| POST | `/api/clases/:id/inscribir` | Inscribirse en una clase | Sí |
| DELETE | `/api/clases/:id/desinscribir` | Desinscribirse de una clase | Sí |

### Partidos y Entradas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/partidos` | Listar partidos | Sí |
| POST | `/api/entradas` | Comprar entradas | Sí |

### Inicialización

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/init` | Obtener todos los datos iniciales | Sí |

## Modelos de Datos

### Usuario
```javascript
{
  id: Integer (PK),
  nombre: String,
  apellido: String,
  dni: String (Unique),
  email: String (Unique),
  password: String (Hashed),
  foto: String (URL Cloudinary),
  rol: Enum('admin', 'user'),
  activo: Boolean,
  cuota_mes: Integer,
  cuota_anio: Integer,
  cuota_estado: Enum('paga', 'pendiente', 'vencida'),
  cuota_medio: String
}
```

### Cancha
```javascript
{
  id: Integer (PK),
  nombre: String,
  tipo: String,
  estado: String
}
```

### Reserva
```javascript
{
  id: Integer (PK),
  fecha: String,
  horaInicio: String,
  horaFin: String,
  canchaId: Integer (FK),
  userId: Integer (FK)
}
```

### Clase
```javascript
{
  id: Integer (PK),
  disciplina: String,
  diaSemana: String,
  hora: String,
  cupo: Integer
}
```

### Partido
```javascript
{
  id: Integer (PK),
  torneo: String,
  rival: String,
  fechaHora: DateTime,
  estadio: String,
  stockEntradas: Integer
}
```

### Entrada
```javascript
{
  id: Integer (PK),
  cantidad: Integer,
  partidoId: Integer (FK),
  userId: Integer (FK)
}
```

## Autenticación y Seguridad

### JWT (JSON Web Tokens)

La API utiliza JWT para autenticación:

1. El usuario inicia sesión con email y password
2. El servidor valida las credenciales y genera un token JWT
3. El cliente almacena el token (localStorage)
4. En cada petición, el cliente envía el token en el header `Authorization`
5. El middleware `verifyToken` valida el token antes de procesar la petición

**Ejemplo de header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Hashing de Contraseñas

Las contraseñas se hashean usando **bcryptjs** con un salt de 10.

### Validaciones

- ✅ Validación de campos requeridos
- ✅ Verificación de duplicados (email, DNI)
- ✅ Control de cupos en clases
- ✅ Control de stock en entradas
- ✅ Validación de solapamiento de reservas
- ✅ Verificación de usuario activo

## Scripts Disponibles

```bash
# Iniciar servidor en producción
npm start

# Iniciar servidor en desarrollo (con nodemon)
npm run dev

# Poblar base de datos con datos de prueba
npm run seed

# Generar hash de contraseña
node scripts/hash-password.js
```

## 👥 Usuarios de Prueba

Después de ejecutar `npm run seed`, se pueden usar estas credenciales:

**Administrador:**
- Email: `admin@aj.com`
- Password: `admin`
- Rol: `admin`

**Usuario Regular:**
- Email: `socio@aj.com`
- Password: `socio`
- Rol: `user`

## Notas Adicionales

- El servidor corre por defecto en el puerto **3000**
- La base de datos debe estar corriendo antes de iniciar el servidor
- Las imágenes de perfil se almacenan en Cloudinary (no localmente)
- Los tokens JWT expiran después de **2 horas**
- El seed reinicia completamente la base de datos (`force: true`)
