class CRUDEngine {
  constructor(database) {
    this.db = database;
  }

  insert(tableName, data) {
    const table = this.db.getTable(tableName);
    
    const row = { 
      _rowId: table.getNextId() 
    };

    if (table.autoIncrementColumn) {
      const autoCol = table.autoIncrementColumn.name;
      if (!data[autoCol]) {
        data[autoCol] = row._rowId;
      }
    }

    table.columns.forEach(col => {
      const value = data[col.name];
      row[col.name] = col.validate(value);
    });

    this._enforceUniqueConstraints(table, row);

    table.rows.push(row);
    
    return this._removeInternalFields(row);
  }

  select(tableName, options = {}) {
    const table = this.db.getTable(tableName);
    
    let results = [...table.rows];

    if (options.where) {
      results = results.filter(row => 
        this._evaluateWhere(row, options.where)
      );
    }

    if (options.columns && options.columns.length > 0) {
      results = results.map(row => {
        const selected = {};
        options.columns.forEach(col => {
          if (!table.hasColumn(col)) {
            throw new Error(`Column '${col}' does not exist in table '${tableName}'`);
          }
          selected[col] = row[col];
        });
        return selected;
      });
    } else {
      results = results.map(row => this._removeInternalFields(row));
    }

    if (options.orderBy) {
      const { column, direction = 'ASC' } = options.orderBy;
      
      if (!table.hasColumn(column)) {
        throw new Error(`Column '${column}' does not exist in table '${tableName}'`);
      }
      
      results.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (aVal === null) return -1;
        if (bVal === null) return 1;
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'DESC' ? -comparison : comparison;
      });
    }

    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  update(tableName, data, where) {
    const table = this.db.getTable(tableName);
    let updatedCount = 0;

    table.rows.forEach(row => {
      if (this._evaluateWhere(row, where)) {
        Object.keys(data).forEach(colName => {
          const col = table.findColumn(colName);
          if (!col) {
            throw new Error(`Column '${colName}' does not exist in table '${tableName}'`);
          }
          
          const newValue = col.validate(data[colName]);
          
          if (newValue !== row[colName]) {
            this._checkUniqueConstraintOnUpdate(table, col, row, newValue);
          }
          
          row[colName] = newValue;
        });
        
        updatedCount++;
      }
    });

    return updatedCount;
  }

  delete(tableName, where) {
    const table = this.db.getTable(tableName);
    
    const toDelete = table.rows.filter(row => 
      this._evaluateWhere(row, where)
    );
    
    toDelete.forEach(row => {
      table.columns.forEach(col => {
        if (col.constraints.primaryKey || col.constraints.unique) {
          table.removeFromIndex(col.name, row[col.name]);
        }
      });
    });

    table.rows = table.rows.filter(row => 
      !this._evaluateWhere(row, where)
    );

    return toDelete.length;
  }

  _evaluateWhere(row, where) {
    if (!where || Object.keys(where).length === 0) {
      return true; 
    }

    return Object.keys(where).every(columnName => {
      const condition = where[columnName];
      const rowValue = row[columnName];

      if (typeof condition === 'object' && condition !== null && condition.operator) {
        return this._evaluateOperator(rowValue, condition.operator, condition.value);
      }

      return rowValue === condition;
    });
  }

  _evaluateOperator(rowValue, operator, compareValue) {
    switch (operator) {
      case '=':
        return rowValue === compareValue;
      
      case '!=':
        return rowValue !== compareValue;
      
      case '>':
        return rowValue > compareValue;
      
      case '>=':
        return rowValue >= compareValue;
      
      case '<':
        return rowValue < compareValue;
      
      case '<=':
        return rowValue <= compareValue;
      
      case 'LIKE':
        
        return String(rowValue).toLowerCase().includes(
          String(compareValue).toLowerCase()
        );
      
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  _enforceUniqueConstraints(table, row) {
    table.columns.forEach(col => {
      if (col.constraints.primaryKey || col.constraints.unique) {
        const value = row[col.name];
        
        if (value !== null && table.indexHasValue(col.name, value)) {
          const constraintType = col.constraints.primaryKey ? 'PRIMARY KEY' : 'UNIQUE';
          throw new Error(
            `Duplicate value for ${constraintType} column '${col.name}': ${value}`
          );
        }
        
        if (value !== null) {
          table.addToIndex(col.name, value, row._rowId);
        }
      }
    });
  }

  _checkUniqueConstraintOnUpdate(table, col, row, newValue) {
    if (col.constraints.primaryKey || col.constraints.unique) {
      const oldValue = row[col.name];
      
      if (newValue !== null && table.indexHasValue(col.name, newValue)) {
        const constraintType = col.constraints.primaryKey ? 'PRIMARY KEY' : 'UNIQUE';
        throw new Error(
          `Duplicate value for ${constraintType} column '${col.name}': ${newValue}`
        );
      }
      
      table.removeFromIndex(col.name, oldValue);
      if (newValue !== null) {
        table.addToIndex(col.name, newValue, row._rowId);
      }
    }
  }

  _removeInternalFields(row) {
    const cleaned = { ...row };
    delete cleaned._rowId;
    return cleaned;
  }
}

module.exports = CRUDEngine;