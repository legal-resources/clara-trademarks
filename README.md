# Clara Trademarks

Sistema de gestión y seguimiento de registros de marcas para Clara.

## Stack Tecnológico

- **Frontend / Backend**: Next.js 15 (App Router) + TypeScript
- **Base de datos**: Neon PostgreSQL (serverless)
- **Autenticación**: NextAuth.js v5 (email + contraseña con bcrypt)
- **Estilos**: Tailwind CSS
- **Deploy**: Vercel

---

## Configuración Inicial

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-org/clara-trademarks.git
cd clara-trademarks
npm install
```

### 2. Configurar Neon PostgreSQL

1. Ve a [console.neon.tech](https://console.neon.tech) y crea un nuevo proyecto
2. En el dashboard del proyecto, abre el **SQL Editor**
3. Ejecuta el contenido completo de `database/schema.sql`
4. Ve a **Connection Details** y copia la **Connection string** (formato `postgresql://...`)

### 3. Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
# Neon PostgreSQL — Connection string del proyecto
DATABASE_URL=postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth — genera un secreto aleatorio:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET=tu_secreto_aleatorio_muy_largo_aqui

# URL base (solo en desarrollo local)
NEXTAUTH_URL=http://localhost:3000
```

### 4. Ejecutar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — regístrate con tu email y comienza a usar la app.

---

## Deploy en GitHub + Vercel

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "feat: clara trademarks app"
git remote add origin https://github.com/tu-org/clara-trademarks.git
git branch -M main
git push -u origin main
```

### Paso 2: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com) → **New Project**
2. Importa el repositorio `clara-trademarks` de GitHub
3. En **Environment Variables**, agrega:

   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | Connection string de Neon |
   | `AUTH_SECRET` | Tu secreto aleatorio |
   | `NEXTAUTH_URL` | `https://tu-app.vercel.app` |

4. Haz clic en **Deploy** ✅

---

## Seguridad

- **Contraseñas**: hash bcrypt con costo 12 (estándar de la industria)
- **Sesiones**: JWT firmado con `AUTH_SECRET`, duración 30 días
- **Middleware**: todas las rutas del dashboard requieren sesión válida
- **SQL**: queries parametrizadas con Neon (prevención de SQL injection)
- **Variables de entorno**: credenciales nunca expuestas en el código
- **Soft delete**: registros eliminados no se borran físicamente
- **Historial de auditoría**: todos los cambios quedan registrados con usuario y timestamp

---

## Características

- ✅ Login y registro con email + contraseña
- ✅ Dashboard con estadísticas y alertas de vencimiento
- ✅ Lista de marcas con búsqueda y filtros (estado, país)
- ✅ Registro completo: nombre, tipo, titular, país, jurisdicción
- ✅ Clasificación de Niza (45 clases, selección visual)
- ✅ 10 estados del proceso registral
- ✅ 7 fechas clave con alertas visuales
- ✅ Datos del agente / despacho
- ✅ Control financiero (tasas, monto, moneda)
- ✅ Prioridad (Convenio de París)
- ✅ Historial de cambios automático
- ✅ Etiquetas personalizadas

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (dashboard)/     # Área protegida
│   │   ├── dashboard/   # Estadísticas generales
│   │   └── trademarks/  # CRUD de marcas
│   └── api/
│       ├── auth/        # NextAuth handler
│       └── register/    # Endpoint de registro
├── auth.ts              # Configuración NextAuth
├── actions/             # Server Actions (lógica de negocio)
├── components/          # Componentes React
└── lib/
    ├── db.ts            # Cliente Neon PostgreSQL
    ├── types.ts         # Tipos TypeScript
    └── utils.ts         # Utilidades
database/
└── schema.sql           # Schema completo para Neon
```
