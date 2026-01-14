class JoinEngine {
  constructor(database) {
    this.db = database;
  }

  innerJoin(table1Name, table2Name, onCondition) {
    const table1 = this.db.getTable(table1Name);
    const table2 = this.db.getTable(table2Name);
    const results = [];

    const col1 = onCondition[table1Name];
    const col2 = onCondition[table2Name];

    if (!table1.hasColumn(col1)) {
      throw new Error(`Column '${col1}' does not exist in table '${table1Name}'`);
    }
    if (!table2.hasColumn(col2)) {
      throw new Error(`Column '${col2}' does not exist in table '${table2Name}'`);
    }

    table1.rows.forEach(row1 => {
      table2.rows.forEach(row2 => {
        if (row1[col1] === row2[col2]) {
          const mergedRow = this._mergeRows(row1, row2, table1Name, table2Name);
          results.push(mergedRow);
        }
      });
    });

    return results;
  }
  leftJoin(table1Name, table2Name, onCondition) {
    const table1 = this.db.getTable(table1Name);
    const table2 = this.db.getTable(table2Name);
    const results = [];

    const col1 = onCondition[table1Name];
    const col2 = onCondition[table2Name];

    if (!table1.hasColumn(col1)) {
      throw new Error(`Column '${col1}' does not exist in table '${table1Name}'`);
    }
    if (!table2.hasColumn(col2)) {
      throw new Error(`Column '${col2}' does not exist in table '${table2Name}'`);
    }

    table1.rows.forEach(row1 => {
      let hasMatch = false;

      table2.rows.forEach(row2 => {
        if (row1[col1] === row2[col2]) {
          const mergedRow = this._mergeRows(row1, row2, table1Name, table2Name);
          results.push(mergedRow);
          hasMatch = true;
        }
      });

      if (!hasMatch) {
        const mergedRow = this._mergeRows(row1, null, table1Name, table2Name);
        results.push(mergedRow);
      }
    });

    return results;
  }

  rightJoin(table1Name, table2Name, onCondition) {
    return this.leftJoin(table2Name, table1Name, {
      [table2Name]: onCondition[table2Name],
      [table1Name]: onCondition[table1Name]
    });
  }

  _mergeRows(row1, row2, table1Name, table2Name) {
    const merged = {};

    Object.keys(row1).forEach(key => {
      if (key !== '_rowId') { 
        merged[`${table1Name}.${key}`] = row1[key];
      }
    });

    if (row2) {
      Object.keys(row2).forEach(key => {
        if (key !== '_rowId') { 
          merged[`${table2Name}.${key}`] = row2[key];
        }
      });
    } else {
      const table2 = this.db.getTable(table2Name);
      table2.columns.forEach(col => {
        merged[`${table2Name}.${col.name}`] = null;
      });
    }

    return merged;
  }

  _validateJoinCondition(onCondition, table1Name, table2Name) {
    if (!onCondition || typeof onCondition !== 'object') {
      throw new Error('Invalid join condition format');
    }

    if (!onCondition[table1Name] || !onCondition[table2Name]) {
      throw new Error(
        `Join condition must specify columns for both tables: ` +
        `{ ${table1Name}: 'column1', ${table2Name}: 'column2' }`
      );
    }
  }
}

module.exports = JoinEngine;