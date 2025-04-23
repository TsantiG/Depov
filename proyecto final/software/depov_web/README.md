# Sistema de Alerta de Emergencia - Medellín (DEPOV_2)

Este es un sistema de alerta de emergencia para la ciudad de Medellín, Colombia, que permite a los usuarios enviar alertas en tiempo real a la policía con su ubicación exacta.

## Características

- Registro de usuarios con información personal y contactos de emergencia
- Panel de usuario para enviar alertas de emergencia
- Panel de administración para gestionar usuarios y ver alertas
- Panel de policía para recibir y atender alertas en tiempo real
- Visualización de ubicación en mapa y cálculo de CAIs cercanos
- Base de datos MySQL para almacenar toda la información

## Requisitos

- Node.js (v14 o superior)
- XAMPP (para MySQL)
- Visual Studio Code

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar la base de datos:
   - Iniciar XAMPP y asegurarse de que MySQL está corriendo
   - Importar el archivo `database.sql` en phpMyAdmin o ejecutarlo directamente en MySQL
4. Iniciar el servidor de desarrollo: `npm run dev`

## Estructura del Proyecto

- `/app`: Componentes y páginas de la aplicación Next.js
- `/components`: Componentes reutilizables
- `/lib`: Funciones y utilidades
- `/app/api`: Rutas de API para interactuar con la base de datos

## Usuarios de Prueba

- **Usuario Regular**:
  - Email: juan@example.com
  - Contraseña: password123

- **Administrador**:
  - Email: admin@example.com
  - Contraseña: admin123

- **Policía**:
  - Email: policia@example.com
  - Contraseña: policia123

## Uso

1. Acceder a la aplicación en `http://localhost:3000`
2. Registrarse como nuevo usuario o iniciar sesión con las credenciales de prueba
3. Como usuario regular, puedes enviar alertas desde tu panel
4. Como administrador, puedes gestionar usuarios y ver todas las alertas
5. Como policía, puedes ver y atender las alertas en tiempo real

## Implementación en Producción

Para implementar en producción:

1. Configurar un servidor MySQL
2. Configurar variables de entorno para la conexión a la base de datos
3. Construir la aplicación: `npm run build`
4. Iniciar la aplicación: `npm start`


en la documentacion encontrara informacion mas detallada, y en la presentacion se encontrara los diagramas y datos para realizar el proyecto