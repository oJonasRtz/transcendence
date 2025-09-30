import sqlite3 from 'sqlite3';
import config from './config.js';
import { dbLogger as logger } from '../utils/logger.js';

const { verbose } = sqlite3;
const Database = verbose().Database;

/**
 * SQLite Database Connection Manager
 *
 * Key Features:
 * - Thread-safe: ensures only one active connection at a time
 * - No busy waiting: relies on a shared Promise
 * - UUID-based logging for easier traceability
 * - Automatic pragma configuration for better performance
 */
export default class DatabaseConnection {
  #db = null;
  #connectionPromise = false;
  #connectionId = crypto.randomUUID();

  constructor() {
    this.#validateConfig();
    logger.debug({ 
      connectionId: this.#connectionId 
    }, 'DatabaseConnection instance created');
  }
  
  /**
   * Validates the database configuration
   * @throws {Error} if the database filename is not configured
   */
  #validateConfig() {
    if (!config?.database?.filename) {
      const error = new Error('Database filename configuration is required');
      logger.error({ 
        connectionId: this.#connectionId,
        config
      }, 'Invalid database configuration');
      throw error;
    }

    logger.debug({
      filename: config.database.filename,
      connectionId: this.#connectionId,
    }, 'Database configuration validated');
  }

  /**
   * Establishes a connection to the database
   * Thread-safe: ensures only one active connection at a time
   * @returns {Promise<Database>} the database connection
   * @throws {Error} if the database connection fails
   */
  async connect() {
    const startTime = Date.now();

    if (this.#db) {
      logger.debug({ 
        connectionId: this.#connectionId 
      }, 'Database already connected');
      return this.#db;
    }

    if (this.#connectionPromise) {
      logger.debug({
         connectionId: this.#connectionId 
      }, 'Reusing existing connection promise');
      return this.#connectionPromise;
    }

    logger.info({
      connectionId: this.#connectionId,
      filename: config.database.filename,
    }, 'Initiating database connection');

    this.#connectionPromise = this.#doConnect();

    try {
      const db = await this.#connectionPromise;

      const duration = Date.now() - startTime;
      logger.info({
        connectionId: this.#connectionId,
        duration,
        filename: config.database.filename,
      }, 'Database connected successfully');

      return db;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({
        error: error.message,
        stack: error.stack,
        connectionId: this.#connectionId,
        duration,
        filename: config.database.filename,
      }, 'Failed to connect to database');
      throw error;
    } finally {
      this.#connectionPromise = null;
    }
  }

  /**
   * Executes the connection process
   * @private
   */
  async #doConnect() {
    try {
      this.#db = await this.#createConnection();
      await this.#configurePragmas();
      return this.#db;
    } catch (error) {
      this.#db = null;
      throw error;
    }
  }

  /**
   * Creates the SQLite connection
   * @private
   */
  #createConnection() {
    return new Promise((resolve, reject) => {
      logger.debug({
        connectionId: this.#connectionId,
      }, 'Creating SQLite database connection');

      const db = new Database(config.database.filename, (err) => {
        if (err) {
          logger.error({
            error: err.message,
            connectionId: this.#connectionId,
          }, 'SQLite connection failed');
          reject(err);
        } else {
          logger.debug({
            connectionId: this.#connectionId,
          }, 'SQLite connection established');
          resolve(db);
        }
      })
    });
  }

  /**
   * Configures the SQLite pragmas for better performance
   * @private
   */
  async #configurePragmas() {
    const pragmas = [
      'PRAGMA foreign_keys = ON',
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = 1000',
      'PRAGMA temp_store = MEMORY',
    ];
    
    logger.debug({
      connectionId: this.#connectionId,
      pragmas,
    }, 'Configuring SQLite pragmas');

    for (const pragma of pragmas) {
      try {
        await this.runPragma(pragma);
        logger.debug({
          connectionId: this.#connectionId,
          pragma,
        }, 'Pragma executed successfully');
      } catch (error) {
        logger.error({
          error: error.message,
          connectionId: this.#connectionId,
          pragma,
        }, 'Failed to execute pragma');
          throw error;
      }
    }
  }

  /**
   * Runs a SQLite pragma
   * @private
   */
  #runPragma(pragma) {
    return new Promise((resolve, reject) => {
      this.#db.run(pragma, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * Closes the database connection
   */
  async close() {
    if (!this.#db) {
      logger.debug({
        connectionId: this.#connectionId,
      }, 'No database connection to close');
      return;
    }

    const startTime = Date.now();

    logger.info({
      connectionId: this.#connectionId,
    }, 'Closing database connection');

    await this.#db.close();

    const duration = Date.now() - startTime;
    logger.info({
      connectionId: this.#connectionId,
      duration,
    }, 'Closing database connection...');
    
    try {
      await new Promise((resolve, reject) => {
        this.#db.close((err) => {
          err ? reject(err) : resolve();
        });
      });

      const duration = Date.now() - startTime;
      logger.info({
        connectionId: this.#connectionId,
        duration,
      }, 'Database connection closed successfully');

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({
        error: error.message,
        stack: error.stack,
        connectionId: this.#connectionId,
        duration,
      }, 'Failed to close database connection');
      throw error;
    } finally {
      this.#db = null;
      this.#connectionPromise = null;
    }
  }

  /**
   * Gets the database connection instance
   * @throws {Error} if the database connection is not established
   */
  getDatabase() {
    if (!this.#db) {
      const error = new Error('Database not connected. Call connect() first.');
      logger.error({
        connectionId: this.#connectionId,
      }, 'Attempted to get database before connecting');
      throw error;
    }
    
    return this.#db;
  }

  /**
   * Checks if is connected
   * @returns {boolean} true if the database is connected, false otherwise
   */
  get isConnected() {
    return this.#db !== null;
  }

  /**
   * Gets the connection ID
   * @returns {string} the connection ID
   */
  get connectionId() {
    return this.#connectionId;
  }

  /** Utility method for logging queries
   * 
   * @param {string} sql - Query SQL
   * @param {Array} params - Query parameters
   * @param {number} duration - Query duration in milliseconds
   */
  logQuery(sql, params = [], duration = null) {
    const logData = {
      connectionId: this.#connectionId,
      sql: sql.trim(),
      params: params.length > 0 ? params : undefined,
      duration,
    };

    // If the query took more than 1 second, log it as a warning
    if (duration && duration > 1000) {
      logger.warn(logData, 'Slow query detected');
    } else {
      logger.debug(logData, 'Query executed');
    }
  }
}