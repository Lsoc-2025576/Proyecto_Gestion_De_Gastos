# Gestor de Gastos — BitcoreSolutions

Aplicación de gestión de gastos personales con backend en **Express + TypeScript + Prisma 7** y frontend en **Angular (standalone, zoneless)**.

---

## 📁 Estructura del proyecto

```
Gestor_de_Gastos_BitcoreSolutions/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── interfaces/
│   │   │   └── user.interface.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   └── auth.routes.ts
│   │   ├── services/
│   │   │   └── auth.services.ts
│   │   ├── scripts/
│   │   │   └── makeAdmin.ts
│   │   └── app.ts
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
└── frontend/
    └── src/app/
        ├── components/
        │   ├── login/
        │   ├── register/
        │   ├── profile/
        │   └── dashboard/
        ├── services/
        ├── app.config.ts
        ├── app.routes.ts
        └── app.ts
```

---

## ⚙️ Requisitos previos

- Node.js
- **pnpm** (el proyecto usa pnpm, no npm — ver sección de errores comunes)
- PostgreSQL corriendo localmente

---

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

> ⚠️ **No uses `npx` ni `npm` para comandos de Prisma en este proyecto.** El `package.json` exige `pnpm` explícitamente (`devEngines`). Usar `npx prisma studio` genera el error `EBADDEVENGINES`. Usa siempre `pnpm prisma <comando>` o `pnpm dlx prisma <comando>`.

### 2. Variables de entorno

Crea `backend/.env`:

```dotenv
PORT=3000

# Base de datos PostgreSQL
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_gastos_db

# Clave para firmar JWT
JWT_SECRET=secreto_super_seguro_123

# URL de conexión para Prisma
DATABASE_URL="postgresql://postgres:admin@localhost:5432/gestor_gastos_db?schema=public"
```

### 3. Configuración de Prisma 7 (`prisma.config.ts`)

**Importante:** desde Prisma 7, la URL de conexión para el **CLI** (migrate, studio, generate) ya NO va dentro de `schema.prisma`. Va en un archivo aparte, `backend/prisma.config.ts`:

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

Y el `schema.prisma` queda **sin** el campo `url`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("CLIENTE")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

### 4. Cliente de Prisma en tiempo de ejecución (driver adapter)

Prisma 7 también exige un **driver adapter** para que `PrismaClient` funcione dentro de la app (`src/config/database.ts`):

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en el .env');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const testDbConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos con Prisma exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
};
```

### 5. Generar el cliente y crear las tablas

```bash
cd backend
pnpm prisma generate
pnpm prisma migrate dev --name init
```

Esto crea las tablas en PostgreSQL automáticamente a partir de `schema.prisma`, sin escribir SQL a mano.

---

## ▶️ Levantar el proyecto

**Backend:**

```bash
cd backend
pnpm dev
```

Deberías ver:

```
✅ Conexión a la base de datos con Prisma exitosa
🚀 Servidor listo en http://localhost:3000
```

**Frontend:**

```bash
cd frontend
pnpm start
```

Corre en `http://localhost:4200`.

---

## 🔐 Arquitectura de autenticación

```
Angular (fetch) → Express Router → Controller → Service → Prisma → PostgreSQL
```

| Archivo | Responsabilidad |
|---|---|
| `auth.routes.ts` | Define los endpoints `POST /api/auth/register` y `POST /api/auth/login` |
| `auth.controller.ts` | Valida el body de la petición y llama al servicio |
| `auth.services.ts` | Lógica de negocio: hash de contraseña (bcrypt), verificación, generación de JWT |
| `auth.middleware.ts` | Middleware `authenticateToken` para proteger rutas con JWT |
| `database.ts` | Instancia única de `PrismaClient` compartida por toda la app |

**Flujo de registro:**
1. Frontend hace `fetch` a `POST /api/auth/register` con `{ name, email, password }`.
2. Controller valida que los campos existan.
3. Service verifica que el email no exista, hashea el password con `bcrypt`, crea el usuario con `role: 'CLIENTE'` por defecto.

**Flujo de login:**
1. Frontend hace `fetch` a `POST /api/auth/login`.
2. Service busca el usuario, compara el password con `bcrypt.compare`.
3. Si es válido, genera un JWT con `{ id, email, role }`, válido por 8 horas.

**Rutas protegidas:**
Se usa el middleware `authenticateToken`, que espera el header `Authorization: Bearer <token>` y decodifica el JWT con `jsonwebtoken`.

---

## 👑 Convertir una cuenta en ADMIN

El campo `role` es un `String` simple (no un enum), por lo que acepta cualquier valor de texto. Para promover una cuenta:

Crea `backend/src/scripts/makeAdmin.ts`:

```typescript
import 'dotenv/config';
import { prisma } from '../config/database.js';

const email = 'correo@ejemplo.com'; // cambia esto por el correo real

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  console.log('Usuario actualizado:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

Ejecuta:

```bash
pnpm tsx src/scripts/makeAdmin.ts
```

> ⚠️ No se recomienda usar el editor inline de **Prisma Studio** (`pnpm prisma studio`) para esto — en la versión 7.9.1 el guardado de ediciones (`update`) falla con error `Failed to fetch` (bug conocido en GitHub). Studio sigue sirviendo para *ver* datos, pero para *modificarlos* usa un script o SQL directo.

Después de cambiar el rol, **vuelve a iniciar sesión** en la app — el JWT anterior sigue teniendo el rol viejo grabado hasta que generes uno nuevo.

---

## 🖥️ Frontend — notas de arquitectura

- Angular standalone components (`RegisterComponent`, `LoginComponent`, etc.), sin `NgModule`.
- `provideZonelessChangeDetection()` en `app.config.ts` — Angular en modo moderno sin Zone.js.
- Las peticiones al backend usan `fetch()` nativo apuntando a `http://localhost:3000/api/...`.

> **Nota sobre modo zoneless:** si en el futuro reemplazas los `alert()` por mensajes de error en pantalla, usa `HttpClient` (ya provisto en `app.config.ts`) o `signal()` en vez de variables normales del componente — con `fetch()` nativo y variables simples, Angular zoneless puede no detectar el cambio automáticamente en la vista.

---

## 🐛 Problemas comunes y sus soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| `No se pudo conectar con el servidor backend` + `Unexpected token '<'` en consola | La ruta del endpoint está comentada en `auth.routes.ts`, Express devuelve HTML 404 en vez de JSON | Descomentar y conectar las rutas al controller |
| `EBADDEVENGINES` al correr `npx prisma ...` | El proyecto exige `pnpm`, no `npm` | Usar `pnpm prisma ...` o `pnpm dlx prisma ...` |
| `No database URL found` | Falta `prisma.config.ts` o el `.env` no se está cargando | Crear `prisma.config.ts` con `datasource.url` apuntando a `DATABASE_URL` |
| `The datasource property 'url' is no longer supported in schema files` | `schema.prisma` todavía tiene `url = env(...)` (sintaxis de Prisma ≤6) | Quitar `url` del `datasource` en `schema.prisma`; la URL va solo en `prisma.config.ts` |
| Prisma Studio: `"update" operation failed — Failed to fetch` | Bug conocido en Prisma Studio 7.9.1 al editar filas inline | Usar un script con `PrismaClient` o SQL directo en vez del editor de Studio |

---

## 📌 Próximos pasos sugeridos

- Modelo de `Gasto` / `Transaccion` en `schema.prisma`, relacionado con `User`.
- Endpoints CRUD de gastos, protegidos con `authenticateToken`.
- Middleware de autorización por rol (`ADMIN` vs `CLIENTE`) para rutas administrativas.
- Reemplazar `alert()` en el frontend por mensajes de error en la UI usando `signal()`.
# 1. Entrar a la carpeta del backend
cd backend

# 2. Instalar dependencias (por si falta alguna)
pnpm install

# 3. Generar el cliente de Prisma actualizado
pnpm prisma generate

# 4. Sincronizar y crear las tablas en tu PostgreSQL local
pnpm prisma db push

# 5. Arrancar el servidor backend (se quedará escuchando)
pnpm dev

# 1. Entrar a la carpeta del frontend
cd frontend
    
# 2. Instalar dependencias
pnpm install

# 3. Iniciar la aplicación de Angular
pnpm starttaskkill /f /im node.exe