/**
 * db.js - JSON Database Utility
 * Handles all read/write operations to local JSON files.
 * Acts as the data access layer for the MRMS backend.
 */

const fs = require('fs');
const path = require('path');

// Base path to all JSON data files
const DATA_DIR = path.join(__dirname, '../data');

/**
 * Read all records from a JSON file
 * @param {string} collection - filename without extension (e.g. 'patients')
 * @returns {Array} array of records
 */
const readAll = (collection) => {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[DB] Error reading ${collection}:`, err.message);
    return [];
  }
};

/**
 * Write an array of records back to a JSON file
 * @param {string} collection - filename without extension
 * @param {Array} data - array of records to persist
 */
const writeAll = (collection, data) => {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[DB] Error writing ${collection}:`, err.message);
    throw new Error(`Failed to write to database: ${collection}`);
  }
};

/**
 * Find a single record by its id field
 * @param {string} collection
 * @param {string} id
 * @returns {Object|null}
 */
const findById = (collection, id) => {
  const records = readAll(collection);
  return records.find((r) => r.id === id) || null;
};

/**
 * Insert a new record into a collection
 * @param {string} collection
 * @param {Object} record - must already contain an 'id' field
 * @returns {Object} the inserted record
 */
const insert = (collection, record) => {
  const records = readAll(collection);
  records.push(record);
  writeAll(collection, records);
  return record;
};

/**
 * Update an existing record by id
 * @param {string} collection
 * @param {string} id
 * @param {Object} updates - partial fields to merge
 * @returns {Object|null} updated record or null if not found
 */
const update = (collection, id, updates) => {
  const records = readAll(collection);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(collection, records);
  return records[idx];
};

/**
 * Delete a record by id
 * @param {string} collection
 * @param {string} id
 * @returns {boolean} true if deleted, false if not found
 */
const remove = (collection, id) => {
  const records = readAll(collection);
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;
  writeAll(collection, filtered);
  return true;
};

/**
 * Filter records using a predicate function
 * @param {string} collection
 * @param {Function} predicate
 * @returns {Array}
 */
const findWhere = (collection, predicate) => {
  const records = readAll(collection);
  return records.filter(predicate);
};

module.exports = { readAll, writeAll, findById, insert, update, remove, findWhere };
