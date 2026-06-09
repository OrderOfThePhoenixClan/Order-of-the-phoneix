#  Order of the Phoenix

Página oficial del clan **Order of the Phoenix** para *Among Us*.

##  ¿Quiénes somos?

Más que un clan, somos una hermandad forjada en el respeto y la sana convivencia.  
Abrimos nuestras alas a tripulantes de todas partes que busquen un refugio de lealtad y diversión.

##  Instalación

```bash
git clone <repo>
cd animacion
npm install
```

Editar `.env` con usuario y contraseña del admin.

##  Uso

```bash
npm start
```

Ir a `http://localhost:3000`  
Panel admin: `http://localhost:3000/admin/`

##  Estructura

```
server.js          # Servidor Express
database/db.js     # Base de datos SQLite
routes/auth.js     # Login / logout
routes/content.js  # CRUD de secciones
middlewares/auth.js# Protección de rutas
public/            # Sitio web estático
  index.html
  admin/           # Panel de administración
.env               # Config (no subir a git)
```

##  Despliegue (Railway)

1. Subir a GitHub
2. En Railway: New Project → Deploy from GitHub
3. Agregar variables de entorno (SESSION_SECRET, ADMIN_USER, ADMIN_PASS)
4. Listo
