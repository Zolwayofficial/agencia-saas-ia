import axios from 'axios';

export class IntegrationsService {
    /**
     * Validates if an email is disposable or fake using Disify API
     */
    static async validateEmail(email: string): Promise<boolean> {
        try {
            const response = await axios.get(`https://disify.com/api/email/${email}`);
            return response.data.format && !response.data.disposable && !response.data.dns === false;
        } catch (error) {
            console.error('Disify API error:', error);
            return true; // Graceful failure: allow the email if API is down
        }
    }

    /**
     * Converts a physical address to coordinates using Nominatim (OpenStreetMap)
     */
    static async geocodeAddress(address: string) {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1
                },
                headers: {
                    'User-Agent': 'SAACS-Agencia-IA'
                }
            });
            return response.data[0] || null;
        } catch (error) {
            console.error('Nominatim API error:', error);
            return null;
        }
    }

    /**
     * Gets the public IP of the server or client using IPify
     */
    static async getPublicIp() {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            return response.data.ip;
        } catch (error) {
            console.error('IPify error:', error);
            return null;
        }
    }

    /**
   * Analyzes text sentiment for aggressive or frustrated language
   * $0 Cost: Uses local analysis to avoid API fees, but can be scaled to MeaningCloud.
   */
    static async analyzeSentiment(text: string) {
        const aggressiveKeywords = [
            'maldito', 'basura', 'mierda', 'estafa', 'robo', 'peor',
            'puto', 'asco', 'odio', 'horrible', 'funciona mal'
        ];

        const lowerText = text.toLowerCase();
        const matches = aggressiveKeywords.filter(word => lowerText.includes(word));

        return {
            isAggressive: matches.length > 0,
            score: matches.length > 0 ? -1 : 0, // Simplified: -1 (bad), 0 (neutral/good)
            detectedWords: matches
        };
    }
}
