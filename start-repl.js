const { Database, REPL } = require('./rdbms');

const db = new Database('interactive');

// Start the REPL
const repl = new REPL(db);
repl.start();