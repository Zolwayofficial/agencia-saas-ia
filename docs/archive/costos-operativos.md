# Costos Operativos: Agencia SaaS MiNuevaLLC

> **Última actualización:** 2026-02-04

---

## 1. Costos Fijos Mensuales

| Concepto | Proveedor | Costo/mes |
|----------|-----------|-----------|
| VPS 6 vCPU / 12GB RAM | Contabo | $12-15 |
| Backup automático | Contabo | $1 |
| DNS + WAF | Cloudflare Free | $0 |
| SSL Certificates | Let's Encrypt | $0 |
| **Total Fijo** | | **$13-16** |

---

## 2. Costos Variables (IA)

### Estrategia Zero-Cost

| Prioridad | Servicio | Límite Gratis | Costo Extra |
|-----------|----------|---------------|-------------|
| 1 | Ollama (local) | Ilimitado | $0 |
| 2 | Groq | 14,400 req/día | $0.05/1M tokens |
| 3 | Cloudflare AI | 10,000 req/día | $0 |
| 4 | Google AI Studio | 1,500 req/día | $0 |

**Costo proyectado de IA:** $0/mes (hasta ~25k mensajes/día)

---

## 3. Costo por Mensaje

| Componente | Costo Estimado |
|------------|----------------|
| LLM (Llama local) | $0 |
| TTS (Kokoro local) | $0 |
| STT (Whisper local) | $0 |
| Infra (VPS prorrateado) | ~$0.001 |
| **Total por mensaje** | **~$0.001-0.003** |

---

## 4. Planes de Precios (Generosos)

| Plan | Interacciones/Hora | Interacciones/Día | Precio | Costo Real | Margen |
|------|---------------------|-------------------|--------|------------|--------|
| **Básico** | 200 | 2,000 | $29/mes | ~$0 | 100% |
| **Pro** | 1,000 | 10,000 | $79/mes | ~$0 | 100% |
| **Enterprise** | Ilimitado | Ilimitado | $199/mes | ~$0 | 100% |

> **Interacción** = texto, audio, imagen, link o llamada. Con IA 100% local, todo es ganancia.

---

## 5. Punto de Equilibrio (Break-even)

| Escenario | Socios Necesarios |
|-----------|-------------------|
| Cubrir costos fijos ($16) | 1 socio Básico |
| Generar $500/mes | 8 socios Básico o 4 Pro |
| Generar $2,000/mes | 25 socios Básico o 10 Enterprise |

---

## 6. Programa de Afiliados

| Concepto | Valor |
|----------|-------|
| Comisión por referido | 20% del primer pago |
| Comisión recurrente | 10% mensual (opcional) |

### Ejemplo

Un socio refiere a alguien que paga el Plan Pro ($79):

- Comisión inmediata: $15.80
- Comisión mensual (si activas): $7.90/mes

---

## 7. Ingresos Adicionales Opcionales

| Servicio | Precio Sugerido | Costo Real | Margen |
|----------|-----------------|------------|--------|
| Generación de imágenes | $0.10/imagen | $0.003 | 97% |
| Setup personalizado | $99 one-time | $0 (tu tiempo) | 100% |
| Documentos adicionales (RAG) | $5/documento | $0 | 100% |

---

## 8. Proyección Anual

| Métrica | Año 1 (Conservador) | Año 1 (Optimista) |
|---------|---------------------|-------------------|
| Socios activos | 20 | 50 |
| Ingreso mensual promedio | $1,000 | $3,000 |
| Costos operativos | $16/mes | $50/mes |
| **Beneficio neto anual** | **~$11,800** | **~$35,400** |
