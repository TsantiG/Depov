# 🚨 DEPOV 2 - Sistema de Alerta de Emergencia en Medellín

DEPOV (Despliegue de Emergencia para Operaciones de Verificación) es un sistema que permite a los usuarios enviar alertas de emergencia en tiempo real con su ubicación exacta a las autoridades, contribuyendo a mejorar la seguridad ciudadana, especialmente de las mujeres en Medellín.

---

## 📱 Características Principales

- Registro y autenticación de usuarios.
- Envío de alertas con ubicación en tiempo real desde la app móvil.
- Asignación automática de CAIs cercanos.
- Panel web para administradores y policías.
- Visualización de alertas en mapas interactivos.
- Gestión de usuarios, alertas y estaciones de policía.

---

## 📦 Estructura del Proyecto

depov_web/ 
├── app/ # Aplicación web (Next.js) <br/>
│ ├── api/ # Endpoints de la API <br/>
│ ├── admin/ # Panel de administración <br/>
│ ├── police/ # Panel para policías <br/>
│ ├── dashboard/ # Panel de usuario <br/>
│ ├── login/ # Inicio de sesión <br/>
│ ├── register/ # Registro <br/>
│ └── ... # Otras páginas y configuración <br/>
├── components/ # Componentes reutilizables <br/>
├── lib/ # Configuración, autenticación y DB <br/>
├── public/ # Archivos estáticos <br/>
└── next.config.mjs # Configuración de Next.js <br/>

Depov/ # Proyecto móvil (Android Studio) <br/>


---

## 🛠️ Instalación y Ejecución en Entorno Local


### 1. Requisitos

- Node.js 18.18.0 o superior
- MySQL 8.0 o superior (XAMPP/WAMP)
- Android Studio (emulador o dispositivo físico)
- Git, Visual Studio Code

---

### 2. Clonar el Proyecto

```bash
git clone https://github.com/TsantiG/Depov.git
cd Depov
 ````

### Instalación Web
- npm install
- npm run build

## Base de Datos
- Abrir PhpMyAdmin o MySQL.

- Crear la base de datos: emergency_alert_system2.

- Importar el archivo emergency_alert_system2.sql.

> [!WARNING]
>⚠️ Configura tus credenciales en lib/db.ts si son diferentes.


## Aplicación Móvil
- Abre android/ en Android Studio.

-Verifica que el archivo RetrofitClient.kt tenga tu IP local (ipconfig en terminal).

```bash
private const val BASE_URL = "http://192.168.1.X:3000/api/"
 ````

- Conecta un dispositivo o inicia un emulador y ejecuta el proyecto.

## Ejecuta el backend:
```bash
npm run dev

Abre en navegador: http://localhost:3000
 ````
---

### Usuarios de Prueba.<br/>
Rol          | Email           | Contraseña <br/>
Usuario | juan@example.com | password123  <br/>
Administrador | admin@example.com | admin123 <br/>
Policía | policia@example.com | policia123 <br/>

> [!INPORTAN]
> Posibles Errores y Soluciones <br/>
> API no responde: Verifica npm run start, la IP correcta y red compartida. <br/>
> Permiso de ubicación: Verifica que el GPS esté activo y permisos concedidos. <br/>
> Timeout: Revisa conexión y aumenta el timeout en Retrofit. <br/>

> [!INPORTAN]
> Futuras Mejoras <br/>
> Notificaciones push en tiempo real. <br/>
> Geolocalización en segundo plano. <br/>
> Chat en tiempo real entre usuarios y autoridades. <br/>
> Estadísticas de alertas y seguridad. <br/>
> Opciones de accesibilidad y diseño.<br/>

> [!NOTE]
> Licencia <br/>
> Este proyecto fue desarrollado como iniciativa académica para el SENA por los estudiantes: <br/>
> Andrés Monsalve Pérez <br/>
> Dayan Berrio Toro <br/>
> Juan David Suárez <br/>
> Santiago Gallego Gutiérrez <br/>

---

## Vistaa Previa web.
https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-14%20162839.png
### 🔹 Página de inicio  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-14%20162839.png)

### 🔹 Página login  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-14%20163004.png)

### 🔹 Página registro  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-14%20163129.png)

### 🔹 Página Home de usuario  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20010947.png)

### 🔹 Página Home usuario // activar alerta 
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-23%20094626.png)

### 🔹 Página de administracion policia
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20011227.png)

### 🔹 Página confiramcion de alerta enviada.  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-23%20094808.png)

---

## Vistas Previa  aplicativo Movil.

### 🔹 Página de inicio  
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214429.png)

### 🔹 Página registro 
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214441.png)

### 🔹 Página login 
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214454.png)

### 🔹 Página Home usuario
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214246.png)

### 🔹 Página activacion de alerta. 
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-21%20161115.png)

### 🔹 Página configuraciones.
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-23%20093033.png)

### 🔹 Página actualizar datos.
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214301.png)

### 🔹 Página confirmacion para cerrar session.
![Home Page](https://github.com/TsantiG/IMG/blob/main/Captura%20de%20pantalla%202025-04-18%20214409.png)


