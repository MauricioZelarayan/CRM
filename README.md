# Proyecto personal
CRM


--------------------

## 🔒 Seguridad

Este proyecto sigue las recomendaciones de OWASP para aplicaciones web. Medidas implementadas:

### Autenticación y gestión de sesión
- Hashing de contraseñas con **bcrypt** (12 salt rounds)
- Sesión manejada con **JWT** firmado y verificado explícitamente con algoritmo `HS256` (previene ataques de algorithm confusion)
- Token JWT almacenado en cookie **HttpOnly**, `Secure` en producción y `SameSite=Lax` (protege contra robo de token vía XSS y mitiga CSRF)
- Expiración de sesión corta (8 horas)
- Mitigación de **timing attacks** en login: se ejecuta `bcrypt.compare` contra un hash dummy aunque el usuario no exista, para igualar los tiempos de respuesta y evitar enumeración de emails registrados

### Protección contra fuerza bruta y bots
- **Rate limiting** independiente por endpoint sensible (`/login` y `/register`) con `express-rate-limit`
- **CAPTCHA (Cloudflare Turnstile)** obligatorio en registro y login, con fail-safe: si falta la clave secreta en producción, la app rechaza el arranque en vez de permitir un bypass silencioso

### Autorización y multi-tenancy
- Control de acceso basado en roles (`SUPERADMIN`, `ADMIN`, `USER`) vía middleware `checkRole`
- **Aislamiento estricto por organización (tenant isolation)**: todas las queries a recursos filtran explícitamente por `organizationId` extraído del JWT, nunca del input del cliente — previene IDOR entre organizaciones

### Validación de entrada
- Validación de `body`, `params` y `query` en cada endpoint con **Zod**, antes de llegar al controller
- Mapeo de errores de validación a respuestas 400 consistentes, sin filtrar detalles internos

### Configuración de red y headers
- **Helmet** para headers de seguridad HTTP por defecto
- **CORS** restringido a origen explícito (no wildcard) con `credentials: true`
- `trust proxy` configurado correctamente para que el rate limiting y la detección de IP funcionen bien detrás de proxies/balanceadores

### Manejo de errores
- Handler de errores centralizado que **no expone stack traces en producción**
- Mensajes de error genéricos en endpoints de autenticación (no se revela si falló el email o la contraseña)

### Persistencia de datos
- Acceso a base de datos vía **Prisma ORM** con queries parametrizadas (previene inyección SQL)
- Transacciones atómicas (`$transaction`) para operaciones que crean múltiples registros relacionados (ej. organización + usuario en el registro)