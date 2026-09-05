# Gestor de Gastos — BitcoreSolutions

Aplicación de gestión de gastos personales con backend en **Express + TypeScript + Prisma 7** y frontend en **Angular (standalone, zoneless)**.

Incluye un módulo de **Ingresos** con cálculo automático de impuestos guatemaltecos (ISR, IGSS, IVA) según el tipo de ingreso y régimen fiscal del usuario.

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
        │   ├── dashboard/
        │   └── ingresos/
        │       ├── ingresos.ts
        │       ├── ingresos.html
        │       ├── ingresos.css
        │       └── income-modal.component.ts
        ├── services/
        │   ├── auth.service.ts
        │   └── income.service.ts
        ├── types/
        │   ├── auth.types.ts
        │   └── income.types.ts
        ├── utils/
        │   └── tax.utils.ts
        ├── app.config.ts
        ├── app.routes.ts
        └── app.ts
```

> ⚠️ **Nota:** la estructura de `services/income.service.ts`, `types/income.types.ts` y el modelo `Income` en `schema.prisma` **no se han compartido en detalle** en este README — están inferidos a partir de cómo se usan en `ingresos.ts` e `income-modal.component.ts`. Si tienes esos archivos, compártelos para dejar esta sección 100% exacta (endpoints reales, nombres de columnas, etc.).

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

Si solo necesitas sincronizar cambios rápidos en desarrollo sin generar un archivo de migración con nombre:

```bash
pnpm prisma db push
```

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

**Reinicio rápido (Windows, cuando el puerto queda ocupado por un proceso Node colgado):**

```bash
taskkill /f /im node.exe
```

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

## 💰 Módulo de Ingresos

El módulo distingue entre **Ingreso Fijo** (sueldo, relación de dependencia) e **Ingreso Variado** (actividades lucrativas / facturación independiente), y aplica automáticamente la carga fiscal correspondiente a cada ítem según las leyes tributarias de Guatemala.

### Clasificación fiscal por ítem

| Tipo de Ingreso | Clasificación | Impuestos aplicados |
|---|---|---|
| Fijo | `SUELDO` (relación de dependencia) | IGSS (4.83%) + ISR de rentas de trabajo (5%/7%, con deducción única) |
| Fijo | `CAPITAL` (alquileres / rentas) | Sin cálculo automático (pendiente de definir régimen de rentas de capital) |
| Variado | `SERVICIO_FACTURADO` + régimen `PEQUENO_CONTRIBUYENTE` | 5% único sobre ingreso bruto (cubre IVA + ISR combinados) |
| Variado | `SERVICIO_FACTURADO` + régimen `OPCIONAL_SIMPLIFICADO` | ISR (5%/7% sobre ingreso bruto mensual) + IVA 12% informativo (cobrado al cliente, **no** reduce el ingreso neto del usuario) |
| Variado | `VENTA_ACTIVO` (venta ocasional de un bien propio) | Sin cálculo automático |

### Fórmulas

**ISR de rentas de trabajo (clasificación `SUELDO`):**
```
igss_mensual = monto * 0.0483
renta_imponible_anual = max(0, (monto * 12) - (igss_mensual * 12) - DEDUCCION_UNICA_ANUAL)

si renta_imponible_anual <= 300000:
    isr_anual = renta_imponible_anual * 0.05
si no:
    isr_anual = 15000 + (renta_imponible_anual - 300000) * 0.07

isr_mensual = isr_anual / 12
total_deducciones = igss_mensual + isr_mensual
```

**Pequeño Contribuyente:**
```
total_deducciones = monto * 0.05   // cubre IVA + ISR combinados
```

**Régimen Opcional Simplificado:**
```
iva_cobrado = monto * 0.12   // informativo, no se resta del ingreso del usuario

si monto <= 30000:
    isr = monto * 0.05
si no:
    isr = (30000 * 0.05) + (monto - 30000) * 0.07

total_deducciones = isr
```

### Constantes fiscales (`utils/tax.utils.ts`)

Todas centralizadas en un solo objeto para facilitar su actualización cuando cambie la ley:

```typescript
export const TAX_CONSTANTS = {
  DEDUCCION_UNICA_ANUAL: 48000,          
  TASA_IGSS_TRABAJADOR: 0.0483,
  TASA_ISR_TRAMO_1: 0.05,
  TASA_ISR_TRAMO_2: 0.07,
  LIMITE_TRAMO_ISR_ANUAL: 300000,
  MONTO_FIJO_TRAMO_2: 15000,
  TASA_PEQUENO_CONTRIBUYENTE: 0.05,
  TASA_IVA: 0.12,
  LIMITE_MENSUAL_ISR_SIMPLIFICADO: 30000,
  LIMITE_ANUAL_PEQUENO_CONTRIBUYENTE: 500285   
};
```

### Componentes involucrados

| Archivo | Responsabilidad |
|---|---|
| `ingresos.ts` | Componente principal: signals de estado, `computed()` para totales/porcentajes/netos, carga de datos vía `IncomeService` |
| `ingresos.html` | Vista: resumen general, columnas Fijo/Variado, tarjetas de desglose de impuestos por ítem |
| `ingresos.css` | Estilos del dashboard (paleta navy/blanco, tags de impuestos por color: ISR rojo-terracota, IGSS azul, IVA morado) |
| `income-modal.component.ts` | Modal de creación/edición de ingresos, con campos condicionales según `type` y `classification` |
| `utils/tax.utils.ts` | Función pura `calculateItemTax()` — toda la lógica de cálculo fiscal, sin dependencias de Angular |

### Signals/computed clave en `ingresos.ts`

```typescript
totalFijo, totalVariado, totalGeneral
porcentajeFijo, porcentajeVariado
fijosCalculated, variadosCalculated   // ítems + su resultado de calculateItemTax()
totalIgss, totalIsrFijo, totalIsrVariado
totalIvaCobrado   // suma del IVA informativo de ítems en régimen Opcional Simplificado
netoFijo, netoVariado, totalNetoGeneral
```

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

## 🖥️ Frontend — notas de arquitectura

- Angular standalone components (`RegisterComponent`, `LoginComponent`, `IngresosComponent`, etc.), sin `NgModule`.
- `provideZonelessChangeDetection()` en `app.config.ts` — Angular en modo moderno sin Zone.js.
- Las peticiones al backend usan `fetch()` nativo apuntando a `http://localhost:3000/api/...`.
- El módulo de Ingresos usa **signals + `computed()`** (no `Observable` + `async pipe`) para todos los totales y cálculos derivados, lo cual funciona bien en modo zoneless.


---

## 🐛 Problemas comunes y sus soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| `No se pudo conectar con el servidor backend` + `Unexpected token '<'` en consola | La ruta del endpoint está comentada en `auth.routes.ts`, Express devuelve HTML 404 en vez de JSON | Descomentar y conectar las rutas al controller |
| `EBADDEVENGINES` al correr `npx prisma ...` | El proyecto exige `pnpm`, no `npm` | Usar `pnpm prisma ...` o `pnpm dlx prisma ...` |
| `No database URL found` | Falta `prisma.config.ts` o el `.env` no se está cargando | Crear `prisma.config.ts` con `datasource.url` apuntando a `DATABASE_URL` |
| `The datasource property 'url' is no longer supported in schema files` | `schema.prisma` todavía tiene `url = env(...)` (sintaxis de Prisma ≤6) | Quitar `url` del `datasource` en `schema.prisma`; la URL va solo en `prisma.config.ts` |
| Prisma Studio: `"update" operation failed — Failed to fetch` | Bug conocido en Prisma Studio 7.9.1 al editar filas inline | Usar un script con `PrismaClient` o SQL directo en vez del editor de Studio |
| `TS2339: Property 'X' does not exist on type 'IngresosComponent'` al compilar | El `.html` usa un `computed()` o método (ej. `totalIvaCobrado()`, `logout()`, `user`) que todavía no está definido en `ingresos.ts` | Agregar el `computed()`/propiedad faltante en la clase del componente antes de referenciarla en la plantilla |

---

