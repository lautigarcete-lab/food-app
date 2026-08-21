# 🍔 Fudi POS

App de caja registradora táctil para negocios gastronómicos: ventas, insumos,
platos, gastos, cierre de jornada y respaldo — 100% offline, con mascota propia
y lista para empaquetarse como APK Android (`com.foodtruck.pos`) vía Capacitor.

## Stack

- **React + Vite** (UI)
- **Tailwind CSS** (paleta pastel: fondo `#FDFBF7`, verde `#10B981`, cheddar `#FBBF24`, coral `#F87171`)
- **Fraunces** (títulos) + **Fredoka** (montos y CTAs) vía Google Fonts, con **Lucide Icons**
- **Capacitor** (empaquetado Android nativo)
- **localStorage** como persistencia local (sin backend)
- **GitHub Actions** para compilar el APK automáticamente

## Estructura del proyecto

```
fudi-pos/
├─ .github/workflows/build-apk.yml   # Pipeline CI que genera el APK
├─ android/                          # Proyecto nativo Android (generado por Capacitor)
├─ src/
│  ├─ components/
│  │  ├─ BurgerMascot.jsx            # Mascota SVG (normal / success / balance)
│  │  └─ CierreJornadaModal.jsx      # Resumen de cierre de caja + compartir WhatsApp
│  ├─ pages/
│  │  ├─ VenderPage.jsx              # Grilla de productos + carrito + cobro
│  │  ├─ CerrarVentaModal.jsx        # Selección de medio de pago + ticket WhatsApp
│  │  ├─ PlatosPage.jsx / PlatoFormModal.jsx
│  │  ├─ InsumosPage.jsx / InsumoFormModal.jsx
│  │  ├─ GastosPage.jsx
│  │  └─ RespaldoPage.jsx            # Exportar/restaurar respaldo .json
│  ├─ lib/db.js                      # Capa de datos (localStorage) + utilidades
│  ├─ styles/index.css               # Tailwind + paleta pastel
│  ├─ App.jsx                        # Navegación inferior entre secciones
│  └─ main.jsx
├─ capacitor.config.ts
├─ tailwind.config.js
└─ package.json
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Generar el build web

```bash
npm run build
```

## Sincronizar con Android (Capacitor)

Cada vez que cambies el código web y quieras reflejarlo en el proyecto nativo:

```bash
npm run cap:sync
```

Para abrir el proyecto en Android Studio:

```bash
npm run cap:open:android
```

## Compilación automática del APK (GitHub Actions)

El workflow `.github/workflows/build-apk.yml` se ejecuta automáticamente en cada
`push` a `main`/`master` y también puede lanzarse manualmente desde la pestaña
**Actions → Build Android APK → Run workflow**, eligiendo `debug` o `release`.

Pasos que ejecuta:

1. Checkout del repositorio.
2. Setup de Node.js 20 y OpenJDK 17.
3. `npm install` y `npm run build`.
4. `npx cap sync android`.
5. `./gradlew assembleDebug` (o `assembleRelease`) dentro de `android/`.
6. Sube el `.apk` resultante como **artefacto descargable** de la ejecución (pestaña *Actions* → la corrida → *Artifacts*).

> **Nota sobre el build `release`:** al no incluir un keystore de firma en el
> repo (por seguridad, nunca debe subirse), el `assembleRelease` generará un
> APK **sin firmar** (`app-release-unsigned.apk`). Para distribuir una versión
> firmada, configurá un keystore como *secret* de GitHub y agregá el paso de
> firmado (`jarsigner`/`apksigner`) al workflow, o firmá el APK localmente
> antes de publicarlo.

## Funcionalidades principales

- **Vender**: grilla de productos en 2 columnas, carrito táctil, selección
  directa de medio de pago (Efectivo / Mercado Pago-Transferencia / Tarjeta),
  botón destacado de **Cobro rápido** (cobra en un toque sin pasar por el
  modal de confirmación) y ticket compartible por WhatsApp al cerrar la venta.
- **Insumos**: carga de nombre, precio del envase cerrado, contenido del
  envase, unidad (gr/ml/u) y stock de envases/paquetes, con cálculo
  automático del costo unitario (`precio del envase / contenido`).
- **Platos**: alta rápida con asociación de insumos **100% opcional**
  (pensada para no frenar la carga de un plato nuevo); al vincular un insumo
  solo se ingresa la cantidad consumida y el costo se calcula solo.
- **Cierre de jornada**: resumen de ventas por medio de pago, gastos del día
  y balance neto, con reporte compartible por WhatsApp.
- **Respaldo**: exportar todos los datos a un `.json` (vía `navigator.share`
  o descarga tradicional) y restaurarlos desde un archivo.

## Datos

Todos los datos (insumos, platos, ventas, gastos) se guardan en el
`localStorage` del dispositivo. Usá la sección **Respaldo** periódicamente
para no perder información si se desinstala la app o se borran los datos del
navegador/WebView.
