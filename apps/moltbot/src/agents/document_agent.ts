/**
 * 📄 Document Agent - Lectura y Generación de Documentos
 * Lee PDFs/imágenes y genera facturas, contratos, presupuestos
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger';
import { config } from '../config';

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://gotenberg:3000';
const LITELLM_URL = process.env.LITELLM_URL || 'http://litellm:4000';
const QDRANT_URL = process.env.QDRANT_URL || 'http://qdrant:6333';

/**
 * Lee un PDF y extrae el texto
 */
export async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
    try {
        const data = await pdfParse(fileBuffer);
        logger.info(`PDF procesado: ${data.numpages} páginas, ${data.text.length} caracteres`);
        return data.text;
    } catch (error) {
        logger.error('Error extrayendo texto de PDF:', error);
        throw error;
    }
}

/**
 * Analiza una imagen usando modelo Vision (GPT-4o, Claude 3.5, etc.)
 */
export async function analyzeImage(imageBase64: string, prompt: string = 'Extrae toda la información de esta imagen en formato JSON'): Promise<any> {
    try {
        const response = await axios.post(`${LITELLM_URL}/chat/completions`, {
            model: 'gpt-4o', // O claude-3-5-sonnet, llama-3.2-vision
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                    ]
                }
            ],
            max_tokens: 1000,
        });

        const content = response.data.choices[0].message.content;
        logger.info('Imagen analizada con Vision');

        // Intentar parsear como JSON
        try {
            return JSON.parse(content);
        } catch {
            return { raw_text: content };
        }
    } catch (error) {
        logger.error('Error analizando imagen:', error);
        throw error;
    }
}

/**
 * Guarda texto en memoria vectorial (Qdrant) para RAG
 */
export async function saveToMemory(text: string, metadata: Record<string, any>): Promise<void> {
    try {
        // Dividir texto en chunks
        const chunks = splitTextIntoChunks(text, 500);

        for (const chunk of chunks) {
            await axios.put(`${QDRANT_URL}/collections/documents/points`, {
                points: [{
                    id: Date.now(),
                    vector: await getEmbedding(chunk),
                    payload: { text: chunk, ...metadata }
                }]
            });
        }

        logger.info(`Guardado en memoria: ${chunks.length} chunks`);
    } catch (error) {
        logger.error('Error guardando en memoria:', error);
        throw error;
    }
}

/**
 * Genera embedding para texto
 */
async function getEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(`${LITELLM_URL}/embeddings`, {
        model: 'text-embedding-3-small',
        input: text
    });
    return response.data.data[0].embedding;
}

/**
 * Divide texto en chunks para vectorización
 */
function splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence + '. ';
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
}

// =========================================
// GENERACIÓN DE DOCUMENTOS PDF
// =========================================

interface InvoiceData {
    clientName: string;
    clientEmail?: string;
    clientAddress?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    notes?: string;
    companyLogo?: string;
}

/**
 * Genera una factura PDF profesional
 */
export async function generateInvoice(data: InvoiceData): Promise<Buffer> {
    const html = buildInvoiceHtml(data);
    return await htmlToPdf(html);
}

/**
 * Genera un presupuesto PDF
 */
export async function generateQuote(data: InvoiceData): Promise<Buffer> {
    const html = buildQuoteHtml(data);
    return await htmlToPdf(html);
}

/**
 * Convierte HTML a PDF usando Gotenberg
 */
async function htmlToPdf(html: string): Promise<Buffer> {
    try {
        const formData = new FormData();
        formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');

        const response = await axios.post(
            `${GOTENBERG_URL}/forms/chromium/convert/html`,
            formData,
            { responseType: 'arraybuffer' }
        );

        logger.info('PDF generado exitosamente');
        return Buffer.from(response.data);
    } catch (error) {
        logger.error('Error generando PDF:', error);
        throw error;
    }
}

/**
 * Construye HTML de factura
 */
function buildInvoiceHtml(data: InvoiceData): string {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-title { font-size: 32px; color: #1f2937; }
    .invoice-number { color: #6b7280; margin-top: 5px; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block h3 { color: #6b7280; font-size: 12px; margin-bottom: 10px; }
    .address-block p { line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; color: #6b7280; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .amount { text-align: right; }
    .totals { width: 300px; margin-left: auto; }
    .totals tr td { padding: 8px 12px; }
    .totals .total-row { font-size: 18px; font-weight: bold; background: #2563eb; color: white; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${data.companyLogo ? `<img src="${data.companyLogo}" height="50">` : 'MiNuevaLLC'}</div>
    <div>
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">#${data.invoiceNumber}</div>
    </div>
  </div>
  
  <div class="addresses">
    <div class="address-block">
      <h3>FACTURAR A</h3>
      <p><strong>${data.clientName}</strong><br>
      ${data.clientEmail || ''}<br>
      ${data.clientAddress || ''}</p>
    </div>
    <div class="address-block">
      <h3>DETALLES</h3>
      <p>Fecha: ${data.date}<br>
      Vencimiento: ${data.dueDate || 'A convenir'}</p>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>DESCRIPCIÓN</th>
        <th style="width: 80px">CANTIDAD</th>
        <th style="width: 120px" class="amount">PRECIO</th>
        <th style="width: 120px" class="amount">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td class="amount">$${item.unitPrice.toFixed(2)}</td>
          <td class="amount">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <table class="totals">
    <tr><td>Subtotal</td><td class="amount">$${subtotal.toFixed(2)}</td></tr>
    <tr><td>IVA (16%)</td><td class="amount">$${tax.toFixed(2)}</td></tr>
    <tr class="total-row"><td>TOTAL</td><td class="amount">$${total.toFixed(2)}</td></tr>
  </table>
  
  <div class="footer">
    ${data.notes ? `<p>${data.notes}</p>` : ''}
    <p>Gracias por su preferencia.</p>
  </div>
</body>
</html>`;
}

/**
 * Construye HTML de presupuesto
 */
function buildQuoteHtml(data: InvoiceData): string {
    // Similar a factura pero con título "PRESUPUESTO" y sin fecha de vencimiento estricta
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #059669; }
    .quote-title { font-size: 32px; color: #1f2937; }
    .quote-number { color: #6b7280; margin-top: 5px; }
    .validity { background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 30px; color: #059669; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .amount { text-align: right; }
    .total { font-size: 24px; text-align: right; color: #059669; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">MiNuevaLLC</div>
    <div>
      <div class="quote-title">PRESUPUESTO</div>
      <div class="quote-number">#${data.invoiceNumber}</div>
    </div>
  </div>
  
  <div class="validity">✨ Este presupuesto es válido por 30 días a partir del ${data.date}</div>
  
  <p style="margin-bottom: 20px"><strong>Para:</strong> ${data.clientName}</p>
  
  <table>
    <thead>
      <tr>
        <th>CONCEPTO</th>
        <th class="amount">CANTIDAD</th>
        <th class="amount">PRECIO UNIT.</th>
        <th class="amount">SUBTOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="amount">${item.quantity}</td>
          <td class="amount">$${item.unitPrice.toFixed(2)}</td>
          <td class="amount">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <p class="total">TOTAL: $${subtotal.toFixed(2)} USD</p>
  
  ${data.notes ? `<p style="margin-top: 30px; color: #6b7280">${data.notes}</p>` : ''}
</body>
</html>`;
}

export default {
    extractTextFromPdf,
    analyzeImage,
    saveToMemory,
    generateInvoice,
    generateQuote,
};
