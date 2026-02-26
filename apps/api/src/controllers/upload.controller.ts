/**
 * File Upload Controller
 * Sube documentos (PDF, Excel, Word, TXT, CSV) y extrae el texto
 * para crear entradas de Knowledge Base automáticamente.
 */

import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import path from 'path';

// Multer config — almacena en memoria (no en disco)
const storage = multer.memoryStorage();

const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/plain',
    'text/csv',
    'application/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}. Usa PDF, Excel, Word, TXT o CSV.`));
        }
    },
});

/** Extrae texto de un archivo según su tipo */
async function extractText(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
    // PDF (pdf-parse v1 — simple function API)
    if (mimetype === 'application/pdf') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        return (data.text || '').trim();
    }

    // Excel (.xlsx, .xls)
    if (mimetype.includes('spreadsheet') || mimetype.includes('ms-excel')) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheets: string[] = [];

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) continue;

            // Convertir a CSV para texto legible
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) {
                sheets.push(`--- ${sheetName} ---\n${csv}`);
            }
        }

        return sheets.join('\n\n').trim();
    }

    // TXT, CSV — directo
    return buffer.toString('utf8').trim();
}

export const uploadController = {
    /** POST /knowledge/upload — Sube un documento y crea entradas de KB */
    async uploadDocument(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'NO_FILE', message: 'No se recibió ningún archivo.' });
            }

            const category = (req.body.category as string) || 'documentos';

            logger.info({
                orgId,
                filename: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            }, 'Processing document upload');

            // Extraer texto
            const extractedText = await extractText(file.buffer, file.mimetype, file.originalname);

            if (!extractedText || extractedText.length < 10) {
                return res.status(400).json({
                    error: 'EMPTY_DOCUMENT',
                    message: 'No se pudo extraer texto del documento. Verifica que no esté vacío o protegido.',
                });
            }

            // Dividir en chunks si es muy largo (max ~2000 chars por entrada)
            const MAX_CHUNK = 2000;
            const chunks: string[] = [];
            const fileName = path.parse(file.originalname).name;

            if (extractedText.length <= MAX_CHUNK) {
                chunks.push(extractedText);
            } else {
                // Dividir por párrafos primero, luego por longitud
                const paragraphs = extractedText.split(/\n\n+/);
                let current = '';

                for (const para of paragraphs) {
                    if ((current + '\n\n' + para).length > MAX_CHUNK && current) {
                        chunks.push(current.trim());
                        current = para;
                    } else {
                        current = current ? current + '\n\n' + para : para;
                    }
                }
                if (current.trim()) {
                    chunks.push(current.trim());
                }
            }

            // Crear entradas de KB
            const entries = await Promise.all(
                chunks.map((content, i) =>
                    prisma.knowledgeEntry.create({
                        data: {
                            organizationId: orgId,
                            category,
                            title: chunks.length === 1
                                ? fileName
                                : `${fileName} (parte ${i + 1}/${chunks.length})`,
                            content,
                        },
                    })
                )
            );

            logger.info({
                orgId,
                filename: file.originalname,
                entriesCreated: entries.length,
                totalChars: extractedText.length,
            }, 'Document processed successfully');

            return res.status(201).json({
                success: true,
                filename: file.originalname,
                entriesCreated: entries.length,
                totalCharacters: extractedText.length,
                entries,
                message: `Se extrajeron ${entries.length} entradas del documento "${file.originalname}".`,
            });

        } catch (error: any) {
            logger.error({ error }, 'Error processing document upload');

            if (error.message?.includes('Tipo de archivo no soportado')) {
                return res.status(400).json({ error: 'INVALID_TYPE', message: error.message });
            }

            return res.status(500).json({
                error: 'UPLOAD_ERROR',
                message: 'Error al procesar el documento. Intenta con otro formato.',
            });
        }
    },
};
