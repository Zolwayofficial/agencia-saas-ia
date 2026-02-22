---
name: Crear Nuevo Agente IA (new-openclaw-agent)
description: Contextualiza cómo desarrollar nuevos scripts de bots/agentes utilizando la arquitectura OpenClaw Runner, el stack de Mercari RPA, Playwright y Python/Typescript.
---

# Habilidad: Generador de Agentes (OpenClaw)

Esta habilidad documenta todo el conocimiento sobre cómo están programados los agentes de web-scraping/automatización en este repositorio, en particular la suite `Influencer-IA`, `OpenClaw` y el proyecto Relister (Mercari/Poshmark).

## 1. Arquitectura de un Agente de Automatización

Actualmente, los Agentes Inteligentes aquí operan con una combinación de **Playwright (Python)** para control de navegadores anti-detect y la **API de OpenAI / IA Estándar** para toma de decisiones y comprensión del DOM.

### Estructura base de Python para tareas web (Relister)

Cuando un usuario pide "Crea un bot de Poshmark", asume esta cascada organizativa:

1. Ubícalo en las carpetas de `infrastructure/images/openclaw-runner/` (Ej. `agents/poshmark/`).
2. Requiere siempre una clase base o script principal (Ej. `agent.py` o `automa.py`).
3. El agente debe heredar `BaseAgent` o `PlaywrightBot`.
4. Importa y utiliza herramientas para evasión (Stealth) ya que Marketplace como Poshmark y Mercari bloquean bots fácilmente.

```python
# snippet_ejemplo.py
from playwright.sync_api import sync_playwright
# Evadir detecciones
import stealth

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        # Inyectar reglas anti bot y viewport realista
        stealth.inject(page)
        
        page.goto("https://ejemplo-marketplace.com")
```

## 2. Tipos e Infraestructura de Model Context Protocol (Worker)

Si el objetivo no es un Web-Scraper (Playwright) sino un **Agente Analista** (Node/TypeScript):

* Todo el código del cerebro analítico ocurre en `/apps/worker/`.
* Para añadir _Tools_ de consulta a esos Agentes, se debe expandir la capa de `postgres-mcp` o añadir clases en `src/jobs/` or `src/lib/mcp.ts` que realicen las funciones correspondientes e instruyan a la IA para usar sus Capabilities (por ejemplo, devolver _Promise<any>_ estrictamente).
