---
name: Optimización UX / CRO Landing Pages (ux-conversion)
description: Establece directrices exactas de Diseño de Interfaces, flujos, copywriting comercial y estética visual orientada a máxima conversión y ventas para la aplicación.
---

# Habilidad: Experto en UX y Conversión (CRO)

El usuario espera recibir una Calidad de Nivel Mundo, interfaces modernas y una "Experiencia de Usuario Superior" que sorprenda a primera vista en la Landing Page (generalmente en `landing/index.html` o Next.js Web App).

## 1. Diseño Estético "SaaS IA" (Look & Feel)

* **Identidad de Marca B2B Pura:** El software es un SaaS de automatización B2B (Manejo de clientes, Bots y Agentes). Evita textos que suenen a Telemarketing o ventas agresivas (para cumplir reglas Stripe). Usa copys de "Soporte Automatizado", "Inbound Marketing" y "Flujos Inteligentes".
* **Colores Premium:** Respeta siempre las paletas de la marca que el usuario haya establecido:
  * Fondo Oscuro/Carbon: `#101F21` ó `var(--dark)`
  * Resaltador Principal (Mint Green): `#50CD95` ó `var(--primary)`
  * Tono Base Calido/Crema: `#FCF0DA` ó `var(--bg-warm)`
    *(Salvo que el usuario de nuevas instrucciones, como el recambio de verde oscuro `#192a29` y claro `#5abf8a` reciente, asume la coherencia extrema).*
* **Efectos Dinámicos Modernos (Glassmorphism):** Implementa sombras sutiles, bordes redondeados (`border-radius: 12px;`) y efectos de transparencia u oscurecedor de fondo (backdrop-filter) en paneles encima de otros para dar sentido de profundidad y "Software High-End".
* **Micro-animaciones (Hover States):** Interactuar con la pantalla es vital. Todo botón debe tener una transición suave `transition: all 0.3s ease;` y oscurecerse ligeramente (Ej. `--primary-hover: #3DB883;`) al pasar el puntero o escalar sutilmente `transform: translateY(-2px);`.

## 2. Estructura Persuasiva (CRO)

Cuando el usuario solicite "Mejorar la landing" o "Hacerla vender más":

1. **H1 Poderoso:** El cabezal principal debe responder: ¿Qué hace? y ¿Para quién es? en 1 frase de 5 palabras.
2. **Llamadas a la Acción (CTA):** Destacadas siempre en el color `--primary`. Mensaje libre de fricción, en lugar de `Comprar ahora` usa `Empieza Gratis` o `Potencia tu Agencia Hoy`.
3. **Jerarquía Visual:** Texto grande => Título, Texto gris/pequeño => Descripción auxiliar. Añade separación `padding/margin` consistente (múltiplos de 8 o 16px).
4. **Social Proof:** Espacios para testimoniales, insignias de seguridad (PCI Compliance / Stripe Ready) aumentan la confianza.

## 3. SEO Básico

Aplica siempre:

```html
<title>Agencia SaaS IA - Automatización de Atención al Cliente</title>
<meta name="description" content="Acelera tus ventas y delega tu soporte con Agentes IA especializados. Construido para B2B.">
```

Usa solo un `<h1>` y estructura jerárquica con `<h2>` y `<h3>`.

> [!TIP]
> **Nunca modifiques la landing page completa destruyendo clases CSS de Tailwind o Vanilla si solo quieres modificar un botón. Haz cambios atómicos.**
