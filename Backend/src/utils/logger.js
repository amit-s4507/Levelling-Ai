import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat
        )
    }),
    // Error log file transport
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: combine(
            timestamp(),
            json()
        )
    }),
    // Combined log file transport
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: combine(
            timestamp(),
            json()
        )
    })
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports
});

// Create a stream object for Morgan
const stream = {
    write: (message) => logger.http(message.trim())
};

// Helper functions for common logging scenarios
const logError = (err, req = null) => {
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        ...err
    };

    if (req) {
        errorDetails.method = req.method;
        errorDetails.url = req.url;
        errorDetails.body = req.body;
        errorDetails.user = req.user?._id;
    }

    logger.error('Error occurred', errorDetails);
};

const logAPIRequest = (req, res, duration) => {
    logger.info('API Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        status: res.statusCode,
        user: req.user?._id
    });
};

const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

const logWarning = (message, meta = {}) => {
    logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

export {
    logger,
    stream,
    logError,
    logAPIRequest,
    logInfo,
    logWarning,
    logDebug
}; 