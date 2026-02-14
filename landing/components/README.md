# Header Component

## 📄 Archivo

`header.html`

## ✨ Características

### Estética Mailchimp

- ✅ **Whitespace generoso**: Nav height 80px (vs 70px original)
- ✅ **Padding aumentado**: 2.5rem lateral (vs 2rem original)
- ✅ **Tipografía legible**: Font-size 1rem (vs 0.95rem original)
- ✅ **Line-height**: 1.6 para mejor legibilidad

### Animaciones Opt imizadas

- ✅ **Solo transform + opacity**: Animaciones en compositor (60fps)
- ✅ **Duration**: 200ms ease-out (transiciones rápidas y suaves)
- ✅ **will-change**: Preparación para animaciones

### Accesibilidad (WCAG AA)

- ✅ **ARIA labels**: `role="banner"`, `role="navigation"`, `role="menu"`
- ✅ **Keyboard navigation**: Tab, Enter, ESC funcionan correctamente
- ✅ **Focus visible**: Outline de 2px en color primario
- ✅ **Touch-friendly**: Mínimo 44px de altura táctil

### Mobile Responsive

- ✅ **Breakpoint**: 1024px
- ✅ **Slide-in menu**: Animación desde la derecha
- ✅ **Backdrop**: Overlay oscuro con cierre al click
- ✅ **Touch targets**: Todos los botones ≥44px

## 🎨 Design System

```css
--primary: #F25722
--primary-dark: #d9400e
--dark: #1A1A1A
--gray: #555555
--light-gray: #F5F5F5
--border: #E5E5E5
```

## 📦 Uso

### Integración Simple

1. Copiar todo el contenido de `header.html`
2. Pegar en tu archivo HTML principal
3. Listo - CSS y JS incluidos inline

### Customización

- **Logo**: Modificar línea 18-20
- **MenuItems**: Modificar estructura `nav-main` (línea 23+)
- **CTAs**: Modificar `nav-actions` (línea 325+)

## ✅ Checklist de Validación

- [x] HTML semántico
- [x] Responsive mobile/tablet/desktop
- [x] Estética Mailchimp (whitespace)
- [x] Accesibilidad (ARIA, keyboard)
- [x] Performance (animaciones optimizadas)
- [ ] **Validación usuario**: Pendiente

## 🔄 Próxima Sección

Hero Section (siguiente en el orden de construcción)
