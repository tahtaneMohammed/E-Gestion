const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // تعطيل الإخراج الثابت لحل مشكلة manifest.webmanifest
  // output: 'export',

  // Asegúrate de que la configuración de Next.js sea correcta
  // Si hay alguna configuración que pueda estar causando problemas con el renderizado estático,
  // ajústala para permitir el renderizado del lado del servidor

  // Por ejemplo, si tienes:
  // output: 'export',

  // Cámbialo a:
  // output: 'standalone',
}

module.exports = withSerwist(nextConfig)

