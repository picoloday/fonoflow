# FonoFlow

Aplicación de gestión de sesiones de logopedia.
**Stack**: CodeIgniter 4 (REST API) + Vue 3 (SPA + PWA)

---

## Estructura del proyecto

```
fonoflow/
├── ci4/    ← Backend PHP (CodeIgniter 4, REST API)
└── vue/    ← Frontend (Vue 3 + Vite + Tailwind + PWA)
```

---

## Requisitos

- PHP 8.x con extensiones: `intl`, `mysqli`, `mbstring`, `openssl`, `pdo_mysql`
- MySQL / MariaDB
- Composer
- Node.js 18+ y npm
- Apache con `mod_rewrite` y `AllowOverride All`

---

## Instalación desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/picoloday/fonoflow.git
cd fonoflow
```

### 2. Backend — CI4

```bash
cd ci4
composer install
cp .env.example .env
```

Edita `.env` con tus datos:

```env
app.baseURL = 'http://fonoflow.test'

database.default.hostname = 127.0.0.1
database.default.database = fonoflow
database.default.username = root
database.default.password = TU_PASSWORD

cors.origin  = http://localhost:5173
api.username = admin
api.password = TU_PASSWORD_API
jwt.secret   = UNA_CADENA_ALEATORIA_DE_32_CARACTERES
```

Ejecuta las migraciones:

```bash
php spark migrate
```

### 3. Apache VirtualHost

Crea un VirtualHost apuntando a la carpeta `public/` del CI4:

```apache
<VirtualHost *:80>
    ServerName fonoflow.test
    DocumentRoot "/ruta/a/fonoflow/ci4/public"
    <Directory "/ruta/a/fonoflow/ci4/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Añade al archivo `hosts` del sistema:
```
127.0.0.1    fonoflow.test
```

Reinicia Apache.

### 4. Frontend — Vue

```bash
cd ../vue
npm install
npm run dev
```

La app estará en `http://localhost:5173`

---

## Configuración de PHP (XAMPP)

Si usas XAMPP con PHP 8, asegúrate de que en `C:\xampp\php\php.ini`:

```ini
extension_dir = "C:/xampp/php/ext"
extension=intl
extension=mysqli
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=curl
```

Y en `C:\xampp\apache\conf\extra\httpd-xampp.conf` añade:

```apache
<IfModule php_module>
    PHPINIDir "C:/xampp/php"
</IfModule>
```

---

## Uso

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173` | App Vue (frontend) |
| `http://fonoflow.test/api/v1/auth/login` | Login API (POST) |
| `http://fonoflow.test/pacientes` | MVC original (sigue funcionando) |

### Login por defecto

- Usuario: el que configures en `.env` → `api.username`
- Contraseña: el que configures en `.env` → `api.password`

---

## Estado del proyecto

- [x] Fase 1 — CI4 convertido a REST API con JWT
- [x] Fase 2 — Vue 3 + Pinia + Vue Router + Tailwind
- [ ] Fase 3 — PWA completa (iconos, offline, notificaciones)
- [ ] Vistas de formularios de citas y sesiones completas
