# Atelier — Idea Canvas

**Atelier** es una aplicación minimalista y elegante para organizar, planificar y desarrollar ideas de proyectos. Diseñada con un enfoque editorial y una estética cálida, combina un canvas creativo ilimitado con herramientas de gestión tipo Scrum para desmenuzar cada proyecto paso a paso.

> *Un estudio de ideas donde la creatividad encuentra estructura.*

---

## ✨ Características

### 🎨 Canvas Creativo Ilimitado
- **Área de trabajo de 3000×2000 píxeles** con scroll y paneo libre
- **Dibujo libre** con pincel configurable (color y grosor)
- **Texto** editable en cualquier posición del canvas
- **Imágenes** arrastrables y redimensionables
- **Tablas** editables con configuración de filas/columnas
- **Navegación intuitiva**: scroll de rueda del mouse y arrastre para paneo

### 📋 Gestión de Ideas
- Panel lateral con lista de ideas, búsqueda en tiempo real y filtros por tags
- Estados visuales: *Idea*, *Planificación*, *En progreso*, *Pausado*, *Completado*
- Iconos personalizables (emoji o imagen de portada) para cada idea
- Tags y descripciones detalladas

### 📊 Scrum Board por Idea
Cada idea tiene su propio tablero Kanban con 4 columnas:
- **Por hacer** — Tareas pendientes
- **En progreso** — Tareas activas
- **Revisión** — Tareas para revisar
- **Hecho** — Tareas completadas

Con prioridades (Baja, Media, Alta) y drag & drop entre columnas.

### 🖥️ App de Escritorio Nativa
Empaquetada con **Tauri** para funcionar como aplicación independiente:
- Sin terminal — doble clic y abre
- Ventana nativa con barra de herramientas del sistema
- Icono en el dock/aplicaciones
- **Persistencia automática** con IndexedDB — todo se guarda en disco

---

## 🖼️ Vista previa

```
┌─────────────────────────────────────────────────────────────┐
│  💡 Atelier          [Nueva idea]     [Lista] [Scrum]      │
├──────────┬──────────────────────────────────────────────────┤
│          │  🧘 App de meditación                    [Editar]│
│  🔍 Buscar│  Planificación  ·  15 ene 2024                    │
│          │                                                  │
│  🧘 Idea │  Canvas  |  Tareas (4)                           │
│  🌿 Idea │  ──────  ─────────────────────────────────────── │
│  ✍️ Prog │  [✏️] [🖊️] [T] [🖼️] [▦] [🧹]  ●───  2         │
│  📚 Idea │                                                  │
│  🎯 Prog │  ┌──────────────────────────────────────────┐   │
│  ☕ Comp │  │  📝 Concepto principal: Meditación +       │   │
│          │  │     Creatividad                            │   │
│          │  │                                            │   │
│          │  │  ┌─────────┬───────────┬──────┐           │   │
│          │  │  │ Métrica │Frecuencia │ Meta │           │   │
│          │  │  ├─────────┼───────────┼──────┤           │   │
│          │  │  │Palabras/│  Diaria   │ 1000 │           │   │
│          │  └──────────────────────────────────────────┘   │
│          │                                                  │
│  6 ideas │  3000 x 2000px                                   │
│  2 prog  │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 🛠️ Requisitos

### Para desarrollo web
- **Node.js** 18+ (recomendado 20.x)
- **npm** 9+

### Para compilar la app de escritorio
- Todo lo anterior, más:
- **Rust** 1.77+ (instalado automáticamente por el script de verificación)
- macOS 10.13+ / Windows 10+ / Linux

---

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd /ruta/donde/quieras
# Si lo descargaste como zip, descomprime y entra a la carpeta
cd Atelier
```

### 2. Instalar dependencias de Node

```bash
npm install
```

> El proyecto incluye un script `postinstall` que marca las dependencias como instaladas. Si `package.json` cambia, el script de lanzamiento detectará la diferencia y reinstalará automáticamente.

### 3. (Solo para desktop) Verificar Rust

En macOS/Linux:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

En Windows, descarga el instalador desde [rustup.rs](https://rustup.rs/).

---

## 🚀 Cómo ejecutar

### Modo desarrollo (navegador)

Ideal para desarrollar y ver cambios en tiempo real:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### App de escritorio en desarrollo

Con hot-reload incluido:

```bash
npm run desktop
```

Esto compila el frontend y abre la ventana nativa de Tauri.

### Compilar la app de escritorio definitiva

```bash
npm run desktop:build
```

El resultado se genera en:

| Plataforma | Ubicación |
|---|---|
| macOS (`.app`) | `src-tauri/target/release/bundle/macos/Atelier.app` |
| macOS (`.dmg`) | `src-tauri/target/release/bundle/dmg/Atelier_*.dmg` |
| Windows (`.msi`) | `src-tauri/target/release/bundle/msi/` |
| Linux (`.AppImage`) | `src-tauri/target/release/bundle/appimage/` |

### Lanzar la app ya compilada

Si ya compilaste una vez, puedes abrirla directamente:

```bash
npm run launch
```

Este script:
1. Verifica que existan las dependencias
2. Instala automáticamente si faltan
3. Compila la app si es la primera vez
4. Abre Atelier como app independiente

### Crear acceso directo en el escritorio (macOS)

```bash
ln -s $(pwd)/src-tauri/target/release/bundle/macos/Atelier.app ~/Desktop/Atelier
```

O copiar a Aplicaciones:

```bash
cp -R src-tauri/target/release/bundle/macos/Atelier.app /Applications/
```

---

## 🧰 Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Next.js |
| `npm run build` | Compila el frontend estático |
| `npm run start` | Sirve el build de producción |
| `npm run check-deps` | Valida e instala dependencias |
| `npm run desktop` | Abre la app de escritorio en modo desarrollo |
| `npm run desktop:build` | Compila la app de escritorio definitiva |
| `npm run launch` | Valida deps y abre la app compilada |
| `npm run tauri:dev` | Alias de `desktop` |
| `npm run tauri:build` | Alias de `desktop:build` |

---

## 🏗️ Estructura del proyecto

```
Atelier/
├── src/
│   ├── app/                    # Rutas y layout de Next.js
│   │   ├── globals.css         # Variables CSS y utilidades
│   │   ├── layout.tsx          # Layout raíz con fuentes
│   │   └── page.tsx            # Página principal
│   ├── components/
│   │   ├── Canvas.tsx          # Canvas creativo (3000×2000px)
│   │   ├── IdeaDetail.tsx      # Detalle de idea con tabs Canvas/Tareas
│   │   ├── IdeaScrumBoard.tsx  # Tablero Kanban por idea
│   │   ├── ScrumBoard.tsx      # Tablero Scrum global de ideas
│   │   ├── Sidebar.tsx         # Panel lateral con lista de ideas
│   │   ├── AddIdeaDialog.tsx   # Modal para crear nuevas ideas
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── lib/
│   │   ├── store.tsx           # Estado global (React Context)
│   │   └── db.ts               # Persistencia con IndexedDB
│   └── types/
│       └── index.ts            # Tipos TypeScript
├── src-tauri/                  # Configuración de Tauri (Rust)
│   ├── src/                    # Código Rust
│   ├── icons/                  # Iconos de la app
│   ├── tauri.conf.json         # Configuración de ventana/bundle
│   └── Cargo.toml              # Dependencias Rust
├── scripts/
│   ├── check-deps.js           # Valida e instala dependencias
│   └── launch.js               # Script de lanzamiento
├── out/                        # Build estático (generado)
├── next.config.ts              # Configuración de Next.js
├── package.json
└── README.md
```

---

## 🎨 Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Animaciones** | Framer Motion |
| **Iconos** | Lucide React |
| **Desktop** | Tauri 2 (Rust + WebKit) |
| **Persistencia** | IndexedDB (navegador nativo) |
| **Fuentes** | Fraunces (display) + Manrope (body) |

---

## 💾 Persistencia de datos

Atelier guarda **todo automáticamente** en tiempo real usando IndexedDB:

- No necesitas botón de "Guardar"
- Los datos sobreviven entre sesiones
- Funciona tanto en navegador como en la app de escritorio
- Si IndexedDB no está disponible, la app funciona igual (modo memoria)

Para **resetear todos los datos** y volver a los valores por defecto, abre la consola del navegador en la app y ejecuta:

```js
indexedDB.deleteDatabase('atelier-db');
location.reload();
```

---

## 🔒 Notas sobre macOS

Como la app no está firmada con un certificado de Apple, la primera vez que la abras puede aparecer un aviso de seguridad. Para permitirla:

1. Ve a **Preferencias del Sistema → Privacidad y Seguridad**
2. Busca el mensaje sobre Atelier
3. Haz clic en **Abrir de todos modos**

Alternativamente, puedes quarentar la app desde terminal:

```bash
xattr -rd com.apple.quarantine /Applications/Atelier.app
```

---

## 📝 Licencia

MIT — Libre para uso personal y comercial.

---

## 🙋 Soporte

Si encuentras algún problema:

1. Verifica que cumples los [requisitos](#️-requisitos)
2. Ejecuta `npm run check-deps` para validar el entorno
3. Si la app de escritorio no compila, asegúrate de que Rust está en tu PATH: `rustc --version`

---

<p align="center">
  <strong>Atelier</strong> — Hecho con ❤️ para organizar grandes ideas.
</p>
