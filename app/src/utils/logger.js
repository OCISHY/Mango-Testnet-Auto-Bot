import { createLogger, format, transports } from 'winston';
import fs from 'fs';

const { combine, timestamp, printf, colorize } = format;

// Custom log format
// 自定义日志格式
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

class Logger {
  constructor() {
    this.logger = createLogger({
      level: "debug",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        customFormat
      ),
      transports: [
        new transports.File({ filename: "log/app.log" })
      ],
      exceptionHandlers: [
        new transports.File({ filename: "log/app.log" })
      ],
      rejectionHandlers: [
        new transports.File({ filename: "log/app.log" })
      ]
    });
  }

  // Log info level messages
  // 记录信息级别的消息
  info(message) {
    this.logger.info(message);
  }

  // Log warn level messages
  // 记录警告级别的消息
  warn(message) {
    this.logger.warn(message);
  }

  // Log error level messages
  // 记录错误级别的消息
  error(message) {
    this.logger.error(message);
  }

  // Log debug level messages
  // 记录调试级别的消息
  debug(message) {
    this.logger.debug(message);
  }

  // Set log level
  // 设置日志级别
  setLevel(level) {
    this.logger.level = level;
  }

  // Clear log file
  // 清除日志文件
  clear() {
    fs.truncate("log/app.log", 0, err => {
      if (err) {
        this.logger.error("Failed to clear the log file: " + err.message);
      } else {
        this.logger.info("Log file cleared");
      }
    });
  }
}

const logger = new Logger();
export default logger;