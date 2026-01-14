const Column = require('./Column');

class Table {
  constructor(name, columns) {
    this.name = name;
    this.columns = columns;
    this.rows = []; 
    this.nextId = 1; 
    
    this.primaryKey = columns.find(col => col.constraints.primaryKey);
    this.autoIncrementColumn = columns.find(col => col.constraints.autoIncrement);
    
    this.indexes = new Map();
    
    columns.forEach(col => {
      if (col.constraints.primaryKey || col.constraints.unique) {
        this.indexes.set(col.name, new Map());
      }
    });

    this._validateTableStructure();
  }

  _validateTableStructure() {
    const columnNames = this.columns.map(col => col.name);
    const uniqueNames = new Set(columnNames);
    if (columnNames.length !== uniqueNames.size) {
      throw new Error(`Table '${this.name}' has duplicate column names`);
    }

    const primaryKeys = this.columns.filter(col => col.constraints.primaryKey);
    if (primaryKeys.length > 1) {
      throw new Error(`Table '${this.name}' can only have one PRIMARY KEY`);
    }

    if (this.autoIncrementColumn && this.autoIncrementColumn.type !== 'INTEGER') {
      throw new Error('AUTO_INCREMENT can only be used with INTEGER columns');
    }
  }

  getColumnNames() {
    return this.columns.map(col => col.name);
  }

  findColumn(name) {
    return this.columns.find(col => col.name === name);
  }

  hasColumn(name) {
    return this.columns.some(col => col.name === name);
  }

  getNextId() {
    return this.nextId++;
  }

  addToIndex(columnName, value, rowId) {
    const index = this.indexes.get(columnName);
    if (index && value !== null) {
      index.set(value, rowId);
    }
  }

  removeFromIndex(columnName, value) {
    const index = this.indexes.get(columnName);
    if (index && value !== null) {
      index.delete(value);
    }
  }

  indexHasValue(columnName, value) {
    const index = this.indexes.get(columnName);
    return index ? index.has(value) : false;
  }

  getStats() {
    return {
      name: this.name,
      columns: this.columns.length,
      rows: this.rows.length,
      indexes: this.indexes.size,
      primaryKey: this.primaryKey ? this.primaryKey.name : null,
      autoIncrement: this.autoIncrementColumn ? this.autoIncrementColumn.name : null
    };
  }

  toString() {
    return `Table: ${this.name} (${this.rows.length} rows, ${this.columns.length} columns)`;
  }
}

module.exports = Table;