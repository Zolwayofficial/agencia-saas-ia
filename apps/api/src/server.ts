import { logger } from '@repo/logger';
import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    logger.info(`🚀 API server running on http://localhost:${PORT}`);
    logger.info(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
});
