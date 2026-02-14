/**
 * 🎙️ Voice Agent - Agente Telefónico
 * Contesta llamadas SIP y responde con IA en tiempo real
 */

import { WorkerOptions, defineAgent, llm, stt, tts } from '@livekit/agents';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHISPER_URL = process.env.WHISPER_URL || 'http://whisper:9000';
const LITELLM_URL = process.env.LITELLM_URL || 'http://litellm:4000';

/**
 * Transcribe audio usando Whisper
 */
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    formData.append('audio_file', new Blob([audioBuffer]), 'audio.wav');

    const response = await axios.post(`${WHISPER_URL}/asr`, formData, {
        params: {
            encode: true,
            task: 'transcribe',
            language: 'es',
            output: 'json',
        },
    });

    return response.data.text || '';
}

/**
 * Genera respuesta con LLM
 */
async function generateResponse(text: string, context: string = ''): Promise<string> {
    const response = await axios.post(`${LITELLM_URL}/chat/completions`, {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `Eres un asistente telefónico amigable de MiNuevaLLC.
Respondes llamadas de forma natural y concisa.
Habla como si estuvieras en una conversación telefónica real.
Mantén las respuestas cortas (máximo 2-3 oraciones).
${context}`,
            },
            { role: 'user', content: text },
        ],
        temperature: 0.7,
        max_tokens: 150,
    });

    return response.data.choices[0].message.content;
}

/**
 * Agente de voz principal
 */
export default defineAgent({
    entry: async (ctx) => {
        console.log('🎙️ Nueva llamada entrante...');

        // Saludo inicial
        await ctx.say('Hola, gracias por llamar a Mi Nueva LLC. ¿En qué puedo ayudarte?');

        // Loop de conversación
        while (true) {
            try {
                // Escuchar al usuario (STT)
                const userAudio = await ctx.listen({ timeout: 30000 });

                if (!userAudio) {
                    await ctx.say('¿Sigues ahí? Si necesitas algo más, avísame.');
                    continue;
                }

                // Transcribir audio
                const userText = await transcribeAudio(userAudio);
                console.log(`Usuario dijo: "${userText}"`);

                // Detectar intención de colgar
                if (userText.toLowerCase().includes('adiós') ||
                    userText.toLowerCase().includes('gracias, eso es todo')) {
                    await ctx.say('¡Perfecto! Gracias por llamar. ¡Que tengas un excelente día!');
                    break;
                }

                // Generar respuesta
                const aiResponse = await generateResponse(userText);
                console.log(`IA responde: "${aiResponse}"`);

                // Hablar respuesta (TTS)
                await ctx.say(aiResponse);

            } catch (error) {
                console.error('Error en conversación:', error);
                await ctx.say('Disculpa, tuve un problema. ¿Podrías repetir eso?');
            }
        }

        console.log('📞 Llamada finalizada');
    },
});

// Worker options
const workerOptions: WorkerOptions = {
    agentName: 'voice-agent',
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    wsUrl: process.env.LIVEKIT_URL || 'ws://livekit:7880',
};

console.log('🎙️ Voice Agent iniciando...');
console.log(`Conectando a: ${workerOptions.wsUrl}`);
