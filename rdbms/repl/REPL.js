const readline = require('readline');
const SQLParser = require('../parser/SQLParser');

class REPL {
  constructor(database) {
    this.db = database;
    this.parser = new SQLParser(database);
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'rdbms> '
    });
  }

  start() {
    this._printWelcome();
    this.rl.prompt();

    // Handle each line of input
    this.rl.on('line', (line) => {
      const input = line.trim();

      // Skip empty lines
      if (!input) {
        this.rl.prompt();
        return;
      }

      // Handle special commands
      if (this._handleSpecialCommand(input)) {
        this.rl.prompt();
        return;
      }

      // Execute SQL command
      try {
        const result = this.parser.execute(input);
        this._displayResult(result);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }

      this.rl.prompt();
    });

    // Handle CTRL+C and CTRL+D
    this.rl.on('close', () => {
      this._printGoodbye();
      process.exit(0);
    });
  }

  _handleSpecialCommand(input) {
    switch (input) {
      case '.exit':
      case '.quit':
        this._printGoodbye();
        process.exit(0);
        return true;

      case '.help':
        this._showHelp();
        return true;

      case '.tables':
        this._showTables();
        return true;

      case '.stats':
        this._showStats();
        return true;

      case '.clear':
        console.clear();
        this._printWelcome();
        return true;

      default:
        if (input.startsWith('.')) {
          console.log(`Unknown command: ${input}. Type .help for help.`);
          return true;
        }
        return false;
    }
  }

  _displayResult(result) {
    // Show success message if present
    if (result.message) {
      console.log(`✓ ${result.message}`);
    }

    if (result.results && result.results.length > 0) {
      console.log('');
      console.table(result.results);
      console.log(`${result.count} row(s) returned\n`);
    } else if (result.results) {
      console.log('0 rows returned\n');
    }

    // Show single row if present (from INSERT)
    if (result.row) {
      console.log('');
      console.table([result.row]);
    }
  }

  _showTables() {
    try {
      const tables = this.db.listTables();
      if (tables.length === 0) {
        console.log('No tables in database.');
      } else {
        console.log('\nTables:');
        tables.forEach((table, i) => {
          console.log(`  ${i + 1}. ${table}`);
        });
        console.log('');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  _showStats() {
    try {
      const stats = this.db.getStats();
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║       Database Statistics              ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`Database: ${stats.name}`);
      console.log(`Tables: ${stats.tableCount}`);
      console.log(`Total Rows: ${stats.totalRows}`);
      console.log(`Created: ${stats.createdAt.toLocaleString()}`);
      
      if (stats.tables.length > 0) {
        console.log('\nTable Details:');
        stats.tables.forEach(table => {
          console.log(`  • ${table.name}: ${table.rows} rows, ${table.columns} columns`);
          if (table.primaryKey) {
            console.log(`    - Primary Key: ${table.primaryKey}`);
          }
        });
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  _printWelcome() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║       Simple RDBMS - Interactive Shell            ║');
    console.log('║       Type SQL commands or .help for help         ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
  }

  _showHelp() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║                  SQL COMMANDS                      ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n📋 Table Operations:');
    console.log('  CREATE TABLE name (col1 TYPE constraints, ...)');
    console.log('  DROP TABLE name');
    console.log('  SHOW TABLES');
    console.log('  SHOW COLUMNS FROM name');
    
    console.log('\n📝 Data Operations:');
    console.log('  INSERT INTO name (cols) VALUES (vals)');
    console.log('  SELECT cols FROM name [WHERE cond] [ORDER BY col] [LIMIT n]');
    console.log('  UPDATE name SET col=val WHERE cond');
    console.log('  DELETE FROM name WHERE cond');
    
    console.log('\n🔗 Join Operations:');
    console.log('  SELECT * FROM t1 INNER JOIN t2 ON t1.col = t2.col');
    console.log('  SELECT * FROM t1 LEFT JOIN t2 ON t1.col = t2.col');
    
    console.log('\n📊 Data Types:');
    console.log('  INTEGER, TEXT, BOOLEAN, DATE');
    
    console.log('\n🔒 Constraints:');
    console.log('  PRIMARY KEY, UNIQUE, NOT NULL, AUTO_INCREMENT');
    
    console.log('\n⚡ Operators:');
    console.log('  =, !=, >, <, >=, <=, LIKE');
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║               SPECIAL COMMANDS                     ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('  .help    - Show this help message');
    console.log('  .tables  - List all tables');
    console.log('  .stats   - Show database statistics');
    console.log('  .clear   - Clear screen');
    console.log('  .exit    - Exit the REPL\n');
    
    console.log('💡 Example:');
    console.log('  CREATE TABLE users (id INTEGER PRIMARY KEY AUTO_INCREMENT, name TEXT);');
    console.log('  INSERT INTO users (name) VALUES (\'Alice\');');
    console.log('  SELECT * FROM users;\n');
  }

  _printGoodbye() {
    console.log('\n👋 Goodbye! Thank you for using Simple RDBMS.\n');
  }
}

module.exports = REPL;