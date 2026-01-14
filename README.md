# Simple RDBMS - Patient Management System

A complete, from-scratch implementation of a relational database management system (RDBMS) with SQL-like interface, built for an interview challenge.

## 🎯 Project Overview

This project demonstrates:
- **Full RDBMS implementation** from scratch (no database libraries)
- **SQL-like query language** with parser and executor
- **Patient management system** as a real-world application
- **Clean, modular architecture** that's easy to understand and extend
- **Interactive REPL** for testing and demonstration

---

## 📁 Complete Project Structure

```
patient-management-system/
│
├── rdbms/                              # Core RDBMS Implementation
│   │
│   ├── storage/                        # STORAGE LAYER - Data Storage
│   │   ├── Column.js                   # Column definitions & validation
│   │   ├── Table.js                    # Table structure & row storage
│   │   └── Database.js                 # Database container
│   │
│   ├── engine/                         # ENGINE LAYER - Query Execution
│   │   ├── CRUDEngine.js               # Create, Read, Update, Delete
│   │   └── JoinEngine.js               # INNER, LEFT, RIGHT joins
│   │
│   ├── parser/                         # PARSER LAYER - SQL Parsing
│   │   └── SQLParser.js                # SQL command parser
│   │
│   ├── repl/                           # REPL LAYER - User Interface
│   │   └── REPL.js                     # Interactive command-line
│   │
│   └── index.js                        # Main exports
│
├── demo.js                             # Patient management demo
├── start-repl.js                       # REPL entry point
├── package.json                        # Project configuration
└── README.md                           # This file
```

---

## 🧩 Component Breakdown

### 1. **STORAGE LAYER** (`rdbms/storage/`)

#### `Column.js` - Column Definition & Validation
**Purpose:** Defines individual table columns with types and constraints

**What it does:**
- Validates data types (INTEGER, TEXT, BOOLEAN, DATE)
- Enforces constraints (PRIMARY KEY, UNIQUE, NOT NULL, AUTO_INCREMENT)
- Converts values to correct types
- Provides error messages for invalid data

**Key methods:**
```javascript
validate(value)        // Validates and converts a value
_validateInteger()     // Validates INTEGER type
_validateText()        // Validates TEXT type
_validateBoolean()     // Validates BOOLEAN type
_validateDate()        // Validates DATE type
```

---

#### `Table.js` - Table Structure & Row Storage
**Purpose:** Manages table schema and stores rows

**What it does:**
- Stores all rows in an array
- Manages indexes for fast lookups
- Tracks auto-increment IDs
- Handles primary key and unique columns
- Provides table metadata

**Key methods:**
```javascript
getColumnNames()       // Returns all column names
findColumn(name)       // Finds a column by name
hasColumn(name)        // Checks if column exists
getNextId()           // Gets next auto-increment ID
addToIndex()          // Adds value to index
removeFromIndex()     // Removes value from index
indexHasValue()       // Checks if value exists in index
```

---

#### `Database.js` - Database Container
**Purpose:** Manages all tables in the database

**What it does:**
- Creates and drops tables
- Stores all tables in a Map
- Validates table names
- Provides database statistics
- Lists all tables

**Key methods:**
```javascript
createTable(name, columns)    // Creates new table
getTable(name)                // Gets table by name
hasTable(name)                // Checks if table exists
dropTable(name)               // Drops a table
listTables()                  // Lists all table names
getAllTables()                // Gets all table objects
getStats()                    // Gets database statistics
```

---

### 2. **ENGINE LAYER** (`rdbms/engine/`)

#### `CRUDEngine.js` - CRUD Operations Executor
**Purpose:** Executes Create, Read, Update, Delete operations

**What it does:**
- **INSERT:** Adds new rows with validation
- **SELECT:** Queries data with WHERE, ORDER BY, LIMIT
- **UPDATE:** Modifies existing rows
- **DELETE:** Removes rows
- Evaluates WHERE clause conditions
- Enforces unique constraints
- Manages indexes during operations

**Key methods:**
```javascript
insert(tableName, data)              // Inserts new row
select(tableName, options)           // Queries rows
update(tableName, data, where)       // Updates rows
delete(tableName, where)             // Deletes rows
_evaluateWhere(row, where)           // Evaluates WHERE clause
_evaluateOperator(val, op, compare)  // Handles =, !=, >, <, LIKE
```

---

#### `JoinEngine.js` - JOIN Operations
**Purpose:** Joins data from multiple tables

**What it does:**
- **INNER JOIN:** Returns matching rows from both tables
- **LEFT JOIN:** Returns all rows from left + matches from right
- **RIGHT JOIN:** Returns all rows from right + matches from left
- Merges rows with table prefixes
- Validates join conditions

**Key methods:**
```javascript
innerJoin(table1, table2, onCondition)  // INNER JOIN
leftJoin(table1, table2, onCondition)   // LEFT JOIN
rightJoin(table1, table2, onCondition)  // RIGHT JOIN
_mergeRows(row1, row2, t1, t2)          // Merges two rows
```

---

### 3. **PARSER LAYER** (`rdbms/parser/`)

#### `SQLParser.js` - SQL Command Parser
**Purpose:** Converts SQL strings into database operations

**What it does:**
- Parses CREATE TABLE statements
- Parses INSERT statements
- Parses SELECT with WHERE, ORDER BY, LIMIT
- Parses UPDATE with SET clause
- Parses DELETE statements
- Parses JOIN queries
- Handles SHOW commands
- Converts SQL values to JavaScript types

**Key methods:**
```javascript
execute(sql)              // Main entry point
_parseCreate(sql)         // Parses CREATE TABLE
_parseInsert(sql)         // Parses INSERT
_parseSelect(sql)         // Parses SELECT
_parseUpdate(sql)         // Parses UPDATE
_parseDelete(sql)         // Parses DELETE
_parseJoin(sql)           // Parses JOINs
_parseShow(sql)           // Parses SHOW commands
_parseWhere(whereStr)     // Parses WHERE clause
_parseValue(valueStr)     // Parses individual values
```

---

### 4. **REPL LAYER** (`rdbms/repl/`)

#### `REPL.js` - Interactive Command-Line Interface
**Purpose:** Provides interactive shell for SQL commands

**What it does:**
- Reads user input line by line
- Executes SQL commands
- Displays results in formatted tables
- Handles special commands (.help, .exit, .tables, .stats)
- Shows errors with helpful messages
- Provides welcome and help screens

**Key methods:**
```javascript
start()                        // Starts the REPL
_handleSpecialCommand(input)   // Handles .help, .exit, etc.
_displayResult(result)         // Displays query results
_showTables()                  // Lists all tables
_showStats()                   // Shows database statistics
_showHelp()                    // Displays help information
```

---

## 🚀 How to Use

### 1. **Setup**

```bash
# No installation needed! Pure JavaScript, no dependencies
# Just make sure you have Node.js installed (v14+)

# Navigate to your project directory
cd patient-management-system
```

### 2. **Run the Demo**

```bash
npm run demo
```

This will:
- Create three tables (patients, doctors, appointments)
- Insert sample data
- Show all CRUD operations
- Demonstrate JOINs
- Test constraints
- Display statistics

### 3. **Start Interactive REPL**

```bash
npm run repl
# or
npm start
```

Then try some commands:

```sql
-- Create a table
CREATE TABLE users (id INTEGER PRIMARY KEY AUTO_INCREMENT, name TEXT NOT NULL);

-- Insert data
INSERT INTO users (name) VALUES ('Alice');

-- Query data
SELECT * FROM users;

-- Update data
UPDATE users SET name = 'Alice Smith' WHERE id = 1;

-- Delete data
DELETE FROM users WHERE id = 1;

-- Show tables
SHOW TABLES;

-- Get help
.help

-- Exit
.exit
```

---

## 📖 SQL Syntax Guide

### CREATE TABLE
```sql
CREATE TABLE table_name (
  column_name TYPE constraints,
  ...
);
```

**Data Types:**
- `INTEGER` - Whole numbers
- `TEXT` - Strings
- `BOOLEAN` - true/false
- `DATE` - Date values

**Constraints:**
- `PRIMARY KEY` - Unique identifier
- `UNIQUE` - Must be unique
- `NOT NULL` - Cannot be null
- `AUTO_INCREMENT` - Auto-generates incrementing IDs

**Example:**
```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  date_of_birth DATE
);
```

### INSERT
```sql
INSERT INTO table_name (col1, col2) VALUES (val1, val2);
```

**Example:**
```sql
INSERT INTO patients (name, email, date_of_birth)
VALUES ('John Doe', 'john@email.com', '1985-03-15');
```

### SELECT
```sql
SELECT columns FROM table_name
[WHERE conditions]
[ORDER BY column ASC|DESC]
[LIMIT n];
```

**Examples:**
```sql
-- All columns
SELECT * FROM patients;

-- Specific columns
SELECT name, email FROM patients;

-- With WHERE
SELECT * FROM patients WHERE id = 1;

-- With operators
SELECT * FROM appointments WHERE appointment_date > '2025-01-15';

-- With LIKE
SELECT * FROM doctors WHERE specialty LIKE 'cardio';

-- With ORDER BY
SELECT * FROM doctors ORDER BY years_experience DESC;

-- With LIMIT
SELECT * FROM patients LIMIT 5;

-- Multiple conditions
SELECT * FROM appointments 
WHERE status = 'scheduled' AND patient_id = 1;
```

### UPDATE
```sql
UPDATE table_name 
SET col1 = val1, col2 = val2
WHERE conditions;
```

**Example:**
```sql
UPDATE appointments 
SET status = 'completed' 
WHERE id = 1;
```

### DELETE
```sql
DELETE FROM table_name WHERE conditions;
```

**Example:**
```sql
DELETE FROM appointments WHERE status = 'cancelled';
```

### JOIN
```sql
-- INNER JOIN
SELECT * FROM table1 
INNER JOIN table2 ON table1.col = table2.col;

-- LEFT JOIN
SELECT * FROM table1 
LEFT JOIN table2 ON table1.col = table2.col;
```

**Example:**
```sql
SELECT * FROM appointments 
INNER JOIN patients ON appointments.patient_id = patients.id;
```

### SHOW
```sql
-- List all tables
SHOW TABLES;

-- Show table structure
SHOW COLUMNS FROM table_name;
```

---

## 🎓 For Your Interview

### What to Highlight:

1. **Architecture:**
   - Clean separation of concerns (storage, engine, parser, REPL)
   - Each component has a single, clear responsibility
   - Easy to test and extend

2. **Database Features:**
   - Full CRUD operations
   - Constraint enforcement
   - Automatic indexing
   - JOIN operations
   - WHERE clause evaluation

3. **Data Integrity:**
   - Type validation
   - Unique constraint checking
   - NOT NULL enforcement
   - Primary key management

4. **Performance:**
   - O(1) lookups for indexed columns
   - Efficient index management
   - Minimal memory overhead

5. **User Experience:**
   - SQL-like syntax (familiar to users)
   - Interactive REPL with help
   - Formatted table output
   - Clear error messages

### Questions You Might Be Asked:

**Q: How does indexing work?**
A: We use a Map data structure for each indexed column (primary key, unique). When a row is inserted, we add the value to the index Map with the row ID. This gives us O(1) lookup time.

**Q: How do you handle transactions?**
A: Currently, we don't have transactions, but this could be added by implementing a transaction log that tracks changes and can roll back operations.

**Q: What about persistence?**
A: Right now it's in-memory, but we could add persistence by serializing the database to JSON and writing to a file, or using a more sophisticated storage format.

**Q: How would you optimize JOIN performance?**
A: Currently using nested loops (O(n*m)). Could optimize by:
- Using indexes for join columns
- Implementing hash joins
- Using sort-merge joins for large datasets

**Q: Can this scale?**
A: For learning and demonstration, yes! For production:
- Add file-based storage
- Implement query optimization
- Add caching layer
- Use B-tree indexes instead of Map
- Add connection pooling for multi-user

---

## 🔄 Next Steps: Building the Web App

Now that the RDBMS is complete, here's how we'll build the web application:

### Backend (Express.js)
1. Create REST API endpoints
2. Initialize database on server start
3. Handle SQL queries from frontend
4. Return JSON responses

### Frontend (React)
1. Patient list and detail views
2. Doctor management interface
3. Appointment scheduling
4. Forms with validation
5. Search and filtering

### Integration
1. Connect frontend to backend
2. Display data in tables/cards
3. Handle CRUD operations
4. Add loading states
5. Show error messages

**Ready to proceed with the backend?** Let me know!

---

## 📝 License

MIT License - Free to use for your interview and projects!

---

## 🙏 Credits

Built entirely from scratch as a technical interview challenge. No external database libraries or ORMs used - just pure JavaScript and Node.js built-in modules.

**Thank you for going through my project** 🚀