
const Database = require('./storage/Database');
const Table = require('./storage/Table');
const Column = require('./storage/Column');

const CRUDEngine = require('./engine/CRUDEngine');
const JoinEngine = require('./engine/JoinEngine');

const SQLParser = require('./parser/SQLParser');

const REPL = require('./repl/REPL');

module.exports = {
  
  Database,
  Table,
  Column,
  
  CRUDEngine,
  JoinEngine,
  
  SQLParser,
 
  REPL,
  
  createDatabase: (name) => {
    return new Database(name);
  },
  
  // Helper function to start REPL
  startREPL: (database) => {
    const repl = new REPL(database);
    repl.start();
  }
};