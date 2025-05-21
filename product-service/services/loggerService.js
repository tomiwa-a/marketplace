const winston = require('winston');

class LoggerService {
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.json()
            ),
            defaultMeta: { service: 'product-service' },
            transports: [
                // Write all logs with importance level of 'error' or less to 'error.log'
                new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
                // Write all logs with importance level of 'info' or less to 'combined.log'
                new winston.transports.File({ filename: './logs/combined.log' }),
            ],
        });

        // If we're not in production, log to the console with colored output
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }));
        }
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }
}

module.exports = LoggerService;