const CRUDEngine = require('../engine/CRUDEngine');
const JoinEngine = require('../engine/JoinEngine');

class SQLParser {
  constructor(database) {
    this.db = database;
    this.crud = new CRUDEngine(database);
    this.join = new JoinEngine(database);
  }

  execute(sql) {
    sql = sql.trim();
    if (sql.endsWith(';')) {
      sql = sql.slice(0, -1).trim();
    }

    const command = sql.split(/\s+/)[0].toUpperCase();

    switch (command) {
      case 'CREATE':
        return this._parseCreate(sql);
      
      case 'DROP':
        return this._parseDrop(sql);
      
      case 'INSERT':
        return this._parseInsert(sql);
      
      case 'SELECT':
        return this._parseSelect(sql);
      
      case 'UPDATE':
        return this._parseUpdate(sql);
      
      case 'DELETE':
        return this._parseDelete(sql);
      
      case 'SHOW':
        return this._parseShow(sql);
      
      default:
        throw new Error(`Unknown SQL command: ${command}`);
    }
  }

  _parseCreate(sql) {
    const match = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*)\)/i);
    if (!match) {
      throw new Error('Invalid CREATE TABLE syntax. Expected: CREATE TABLE name (columns)');
    }

    const tableName = match[1];
    const columnDefs = match[2].split(',').map(def => def.trim());

    const columns = columnDefs.map(def => this._parseColumnDefinition(def));

    this.db.createTable(tableName, columns);
    
    return { 
      message: `Table '${tableName}' created successfully`,
      table: tableName
    };
  }

  _parseColumnDefinition(definition) {
    const parts = definition.split(/\s+/);
    const name = parts[0];
    const type = parts[1].toUpperCase();
    
    const upperDef = definition.toUpperCase();
    const constraints = {
      primaryKey: upperDef.includes('PRIMARY KEY'),
      unique: upperDef.includes('UNIQUE') && !upperDef.includes('PRIMARY KEY'),
      notNull: upperDef.includes('NOT NULL'),
      autoIncrement: upperDef.includes('AUTO_INCREMENT') || upperDef.includes('AUTOINCREMENT')
    };

    return { name, type, constraints };
  }

  _parseDrop(sql) {
    const match = sql.match(/DROP\s+TABLE\s+(\w+)/i);
    if (!match) {
      throw new Error('Invalid DROP TABLE syntax. Expected: DROP TABLE name');
    }

    const tableName = match[1];
    this.db.dropTable(tableName);
    
    return { 
      message: `Table '${tableName}' dropped successfully`,
      table: tableName
    };
  }

  _parseInsert(sql) {
    const match = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (!match) {
      throw new Error('Invalid INSERT syntax. Expected: INSERT INTO table (columns) VALUES (values)');
    }

    const tableName = match[1];
    const columns = match[2].split(',').map(c => c.trim());
    const values = this._parseValueList(match[3]);

    if (columns.length !== values.length) {
      throw new Error(`Column count (${columns.length}) doesn't match value count (${values.length})`);
    }

    const data = {};
    columns.forEach((col, i) => {
      data[col] = values[i];
    });

    const row = this.crud.insert(tableName, data);
    
    return { 
      message: 'Row inserted successfully',
      row
    };
  }

  _parseSelect(sql) {
    if (sql.toUpperCase().includes(' JOIN ')) {
      return this._parseJoin(sql);
    }

    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)/i);
    if (!selectMatch) {
      throw new Error('Invalid SELECT syntax. Expected: SELECT columns FROM table');
    }

    const columnsStr = selectMatch[1].trim();
    const tableName = selectMatch[2];
    
    const options = {};

    if (columnsStr !== '*') {
      options.columns = columnsStr.split(',').map(c => c.trim());
    }

    const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch) {
      options.where = this._parseWhere(whereMatch[1].trim());
    }

    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      options.orderBy = {
        column: orderMatch[1],
        direction: orderMatch[2] ? orderMatch[2].toUpperCase() : 'ASC'
      };
    }

    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      options.limit = parseInt(limitMatch[1]);
    }

    const results = this.crud.select(tableName, options);
    
    return { 
      results,
      count: results.length
    };
  }

  _parseUpdate(sql) {
    const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?$/i);
    if (!match) {
      throw new Error('Invalid UPDATE syntax. Expected: UPDATE table SET col=val WHERE condition');
    }

    const tableName = match[1];
    const setClause = match[2];
    const whereClause = match[3];

    const data = {};
    setClause.split(',').forEach(assignment => {
      const [col, val] = assignment.split('=').map(s => s.trim());
      data[col] = this._parseValue(val);
    });

    const where = whereClause ? this._parseWhere(whereClause) : {};

    const count = this.crud.update(tableName, data, where);
    
    return { 
      message: `${count} row(s) updated`,
      count
    };
  }

  _parseDelete(sql) {
    const match = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?$/i);
    if (!match) {
      throw new Error('Invalid DELETE syntax. Expected: DELETE FROM table WHERE condition');
    }

    const tableName = match[1];
    const whereClause = match[2];

    const where = whereClause ? this._parseWhere(whereClause) : {};

    const count = this.crud.delete(tableName, where);
    
    return { 
      message: `${count} row(s) deleted`,
      count
    };
  }

  _parseJoin(sql) {
    const joinMatch = sql.match(
      /FROM\s+(\w+)\s+(INNER|LEFT|RIGHT)\s+JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i
    );
    
    if (!joinMatch) {
      throw new Error('Invalid JOIN syntax. Expected: SELECT * FROM t1 JOIN t2 ON t1.col = t2.col');
    }

    const table1Name = joinMatch[1];
    const joinType = joinMatch[2].toUpperCase();
    const table2Name = joinMatch[3];
    const onTable1 = joinMatch[4];
    const onCol1 = joinMatch[5];
    const onTable2 = joinMatch[6];
    const onCol2 = joinMatch[7];

    const onCondition = {
      [onTable1]: onCol1,
      [onTable2]: onCol2
    };

    let results;
    if (joinType === 'INNER') {
      results = this.join.innerJoin(table1Name, table2Name, onCondition);
    } else if (joinType === 'LEFT') {
      results = this.join.leftJoin(table1Name, table2Name, onCondition);
    } else if (joinType === 'RIGHT') {
      results = this.join.rightJoin(table1Name, table2Name, onCondition);
    }

    return { 
      results,
      count: results.length
    };
  }

  _parseShow(sql) {
   
    if (sql.match(/SHOW\s+TABLES/i)) {
      const tables = this.db.listTables();
      return { 
        results: tables.map(name => ({ table_name: name })),
        count: tables.length
      };
    }

    const match = sql.match(/SHOW\s+COLUMNS\s+FROM\s+(\w+)/i);
    if (match) {
      const table = this.db.getTable(match[1]);
      const columns = table.columns.map(col => ({
        name: col.name,
        type: col.type,
        constraints: Object.keys(col.constraints)
          .filter(k => col.constraints[k])
          .join(', ') || 'none'
      }));
      return { 
        results: columns,
        count: columns.length
      };
    }

    throw new Error('Invalid SHOW syntax. Use: SHOW TABLES or SHOW COLUMNS FROM table');
  }

  _parseWhere(whereStr) {
    const where = {};
    
    const conditions = whereStr.split(/\s+AND\s+/i);
    
    conditions.forEach(condition => {
      const operatorMatch = condition.match(/(\w+)\s*(=|!=|>=|<=|>|<|LIKE)\s*(.+)/i);
      
      if (operatorMatch) {
        const column = operatorMatch[1];
        const operator = operatorMatch[2];
        const value = this._parseValue(operatorMatch[3].trim());
        
        if (operator === '=') {
          where[column] = value;
        } else {
          where[column] = { operator, value };
        }
      }
    });
    
    return where;
  }

  _parseValueList(valuesStr) {
    return valuesStr.split(',').map(v => this._parseValue(v.trim()));
  }

  _parseValue(valueStr) {
    valueStr = valueStr.trim();
    
    if ((valueStr.startsWith("'") && valueStr.endsWith("'")) ||
        (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
      return valueStr.slice(1, -1);
    }
    
    if (valueStr.toUpperCase() === 'NULL') {
      return null;
    }
    
    if (valueStr.toUpperCase() === 'TRUE') return true;
    if (valueStr.toUpperCase() === 'FALSE') return false;
    
    if (!isNaN(valueStr) && valueStr !== '') {
      return Number(valueStr);
    }
    
    return valueStr;
  }
}

module.exports = SQLParser;