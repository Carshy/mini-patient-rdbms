const Table = require('./Table');
const Column = require('./Column');

class Database {
  constructor(name = 'default') {
    this.name = name;
    this.tables = new Map();
    this.createdAt = new Date();
  }

  createTable(name, columnDefinitions) {
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists`);
    }

    if (!this._isValidTableName(name)) {
      throw new Error(`Invalid table name: '${name}'. Use only letters, numbers, and underscores.`);
    }

    const columns = columnDefinitions.map(colDef => 
      new Column(colDef.name, colDef.type, colDef.constraints || {})
    );

    const table = new Table(name, columns);
    this.tables.set(name, table);
    
    return table;
  }

  getTable(name) {
    const table = this.tables.get(name);
    if (!table) {
      throw new Error(`Table '${name}' does not exist`);
    }
    return table;
  }

  hasTable(name) {
    return this.tables.has(name);
  }

  dropTable(name) {
    if (!this.tables.has(name)) {
      throw new Error(`Table '${name}' does not exist`);
    }
    return this.tables.delete(name);
  }

  listTables() {
    return Array.from(this.tables.keys());
  }

  getAllTables() {
    return Array.from(this.tables.values());
  }

  clear() {
    this.tables.clear();
  }

  getStats() {
    const tableStats = Array.from(this.tables.values()).map(table => table.getStats());
    
    return {
      name: this.name,
      tableCount: this.tables.size,
      tables: tableStats,
      totalRows: tableStats.reduce((sum, t) => sum + t.rows, 0),
      createdAt: this.createdAt
    };
  }

  _isValidTableName(name) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  toString() {
    return `Database: ${this.name} (${this.tables.size} tables)`;
  }
}

module.exports = Database;