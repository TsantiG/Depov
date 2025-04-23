/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar estos headers a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // O especifica los orígenes permitidos
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com'], // Añadir el dominio de la imagen del footer
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Tamaños de dispositivo para optimización
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamaños de imagen para optimización
    formats: ['image/webp', 'image/avif'], // Formatos modernos para mejor rendimiento
  },
};

export default nextConfig;

