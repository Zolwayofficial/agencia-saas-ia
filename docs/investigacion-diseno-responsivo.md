# Arquitectura Integral de la Web Responsiva

> **Compendio Técnico Exhaustivo - 2025**  
> **Aplicación: Formularios y Landing Pages Impulsa USA**

---

## Resumen Ejecutivo

El Diseño Web Responsivo (RWD) representa un cambio de paradigma hacia la **"Web Única"**: una base de código HTML que sirve el mismo contenido a todos los usuarios, independientemente del dispositivo.

**Tres pilares técnicos:**
1. Rejillas fluidas (Fluid Grids)
2. Imágenes flexibles
3. Consultas de medios (Media Queries)

**Importancia crítica:**
- Google: indexación Mobile-First (la versión móvil determina el ranking)
- La web responsiva moderna es **agnóstica al dispositivo**

---

## 1. Fundación del Viewport

### 1.1 Meta Viewport (Obligatorio)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| Atributo | Función |
|----------|---------|
| `width=device-width` | Ancho del viewport = ancho físico del dispositivo |
| `initial-scale=1.0` | Zoom inicial 1:1 (sin reducci&oacute;n) |

### 1.2 Accesibilidad

> ⚠️ **NUNCA usar** `user-scalable=no` - Viola pautas WCAG

Los usuarios con baja visión dependen del zoom para leer contenido.

### 1.3 Unidades Relativas

| Unidad | Uso |
|--------|-----|
| `%` | Rejillas fluidas |
| `rem` | Tipografía (respeta preferencias del usuario) |
| `vw, vh` | Porcentaje del viewport |

---

## 2. Estrategia CSS: Mobile-First

### 2.1 Mobile-First (Recomendado)

Estilos base para móvil, luego `min-width` para pantallas más grandes.

```css
/* Base: Móvil */
body {
  display: flex;
  flex-direction: column;
}

/* Tablet */
@media (min-width: 768px) {
  body {
    flex-direction: row;
  }
}

/* Escritorio */
@media (min-width: 1024px) {
  body {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Ventajas:**
1. Priorización de contenido esencial
2. Mejor rendimiento (móviles ignoran CSS de pantallas grandes)
3. Código más limpio y menos redundante

### 2.2 Breakpoints Recomendados

| Categoría | Rango |
|-----------|-------|
| Móvil pequeño/medio | < 640px |
| Tablet/Móvil grande | 640px - 1024px |
| Escritorio/Laptop | 1024px - 1280px |
| Pantalla ancha | > 1280px |

> **Mejor práctica:** Insertar breakpoints cuando el diseño "se rompe", no por dispositivo específico.

---

## 3. Media Queries Avanzadas

### 3.1 Operadores Lógicos

| Operador | Uso |
|----------|-----|
| `and` | Combina condiciones (ambas deben ser verdaderas) |
| `,` | OR (cualquiera puede ser verdadera) |
| `not` | Niega una consulta |

### 3.2 Nueva Sintaxis de Rango (Level 4)

```css
/* Tradicional */
@media (min-width: 320px) and (max-width: 768px) { }

/* Nueva (más legible) */
@media (320px <= width <= 768px) { }
```

### 3.3 Características Avanzadas

| Característica | Uso |
|----------------|-----|
| `prefers-color-scheme` | Detecta modo oscuro/claro |
| `prefers-reduced-motion` | Usuarios que prefieren menos animación |
| `hover` / `pointer` | Detecta táctil vs ratón |
| `orientation` | Portrait vs landscape |

---

## 4. Flexbox vs CSS Grid

### Tabla Comparativa

| Característica | Flexbox | CSS Grid |
|---------------|---------|----------|
| **Dimensión** | Unidimensional (fila O columna) | Bidimensional (filas Y columnas) |
| **Mentalidad** | Content-First | Layout-First |
| **Uso principal** | Componentes, alineación | Estructura de página |

### 4.1 Flexbox - Propiedades Clave

```css
.container {
  display: flex;
  flex-wrap: wrap; /* Elementos saltan a nueva línea */
  justify-content: center;
  align-items: center;
}
```

### 4.2 CSS Grid - Responsive Sin Media Queries

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

Esta línea crea tantas columnas como quepan (mínimo 250px cada una).

### 4.3 Enfoque Híbrido (Recomendado)

- **Grid:** Arquitectura macro (header, main, footer, sidebar)
- **Flexbox:** Micro-arquitectura (contenido dentro de componentes)

---

## 5. Imágenes Responsivas

### 5.1 Fluidez Básica (Obligatorio)

```css
img, video, iframe {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### 5.2 srcset y sizes (Cambio de Resolución)

```html
<img 
  src="foto-800w.jpg"
  srcset="foto-400w.jpg 400w,
          foto-800w.jpg 800w,
          foto-1200w.jpg 1200w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  alt="Descripción">
```

El navegador elige la imagen óptima automáticamente.

### 5.3 picture (Dirección de Arte)

```html
<picture>
  <source media="(max-width: 799px)" srcset="foto-recortada.jpg">
  <source media="(min-width: 800px)" srcset="foto-panoramica.jpg">
  <img src="foto-panoramica.jpg" alt="Descripción">
</picture>
```

### 5.4 Optimización

- **Formatos modernos:** WebP, AVIF
- **Lazy loading:** `loading="lazy"` en imágenes fuera de vista

---

## 6. Tipografía Fluida

### 6.1 Función clamp()

```css
h1 {
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
}
```

| Parámetro | Valor | Función |
|-----------|-------|---------|
| MIN | 1.5rem | Nunca menor (móviles pequeños) |
| VAL | 2vw + 1rem | Escala dinámicamente |
| MAX | 3rem | Nunca mayor (pantallas ultra anchas) |

### 6.2 rem vs px

> **Siempre usar `rem`** - Respeta configuración de accesibilidad del usuario

---

## 7. Container Queries (Próxima Era)

Las Media Queries consultan el viewport global. Las **Container Queries** consultan el contenedor padre.

### 7.1 Implementación

```css
/* Definir contenedor */
.sidebar {
  container-type: inline-size;
  container-name: barra-lateral;
}

/* Consultar contenedor */
@container barra-lateral (width > 300px) {
  .tarjeta {
    display: flex;
    flex-direction: row;
  }
}

@container barra-lateral (width <= 300px) {
  .tarjeta {
    display: block;
  }
}
```

**Soporte:** Chrome 106+, Edge 106+, Safari 16+, Firefox 110+

### 7.2 Unidades de Contenedor

| Unidad | Significado |
|--------|-------------|
| `cqw` | 1% del ancho del contenedor |
| `cqh` | 1% de la altura del contenedor |

---

## 8. Tailwind CSS - Sintaxis Responsiva

```html
<div class="bg-red-500 md:bg-green-500 lg:bg-blue-500 w-full md:w-1/2">
</div>
```

| Prefijo | Breakpoint |
|---------|------------|
| (ninguno) | Móvil (default) |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |

---

## 9. Accesibilidad WCAG

### 9.1 Criterio 1.4.10 (Reflow)

El sitio debe funcionar sin scroll horizontal a **320px de ancho**.

### 9.2 Objetivos Táctiles

- **Mínimo:** 44x44 píxeles CSS
- Suficiente espaciado entre elementos

---

## 10. HTML5 Boilerplate Moderno

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sitio Responsivo</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    img, video { max-width: 100%; height: auto; display: block; }
    
    html { font-size: 100%; }
    
    body {
      font-family: system-ui, sans-serif;
      line-height: 1.5;
    }
    
    .wrapper {
      width: min(100% - 2rem, 1200px);
      margin-inline: auto;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Contenido -->
  </div>
</body>
</html>
```

### Componentes Clave

| Elemento | Función |
|----------|---------|
| `box-sizing: border-box` | Padding incluido en el ancho |
| `min(100% - 2rem, 1200px)` | Márgenes en móvil, ancho máx en escritorio |

---

## Checklist Rápido RWD

- [ ] Meta viewport configurado
- [ ] Imágenes con `max-width: 100%`
- [ ] Estrategia Mobile-First
- [ ] Breakpoints basados en contenido
- [ ] `rem` para tipografía
- [ ] `clamp()` para tipografía fluida
- [ ] Grid para layout, Flexbox para componentes
- [ ] `srcset` para imágenes
- [ ] `loading="lazy"` en imágenes
- [ ] Objetivos táctiles 44x44px

---

*Investigación de Diseño Responsivo - Enero 2026*
