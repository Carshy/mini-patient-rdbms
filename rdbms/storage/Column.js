class Column {
  constructor(name, type, constraints = {}) {
    this.name = name;
    this.type = type.toUpperCase();
    this.constraints = {
      primaryKey: constraints.primaryKey || false,
      unique: constraints.unique || false,
      notNull: constraints.notNull || false,
      autoIncrement: constraints.autoIncrement || false
    };
    
    // Validate type
    const validTypes = ['INTEGER', 'TEXT', 'BOOLEAN', 'DATE'];
    if (!validTypes.includes(this.type)) {
      throw new Error(`Invalid column type: ${type}. Valid types: ${validTypes.join(', ')}`);
    }
  }

  validate(value) {
    if (this.constraints.notNull && (value === null || value === undefined)) {
      throw new Error(`Column '${this.name}' cannot be NULL`);
    }

    if (value === null || value === undefined) {
      return null;
    }

    return this._convertType(value);
  }

  _convertType(value) {
    switch (this.type) {
      case 'INTEGER':
        return this._validateInteger(value);
      
      case 'TEXT':
        return this._validateText(value);
      
      case 'BOOLEAN':
        return this._validateBoolean(value);
      
      case 'DATE':
        return this._validateDate(value);
      
      default:
        throw new Error(`Unknown type: ${this.type}`);
    }
  }

  _validateInteger(value) {
    const num = Number(value);
    if (!Number.isInteger(num) || isNaN(num)) {
      throw new Error(`Column '${this.name}' expects INTEGER, got: ${value}`);
    }
    return num;
  }

  _validateText(value) {
    return String(value);
  }

  _validateBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    
    const strValue = String(value).toLowerCase();
    if (strValue === 'true' || strValue === '1') return true;
    if (strValue === 'false' || strValue === '0') return false;
    
    throw new Error(`Column '${this.name}' expects BOOLEAN, got: ${value}`);
  }

  _validateDate(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Column '${this.name}' expects valid DATE, got: ${value}`);
    }
    return date.toISOString();
  }

  toString() {
    const constraints = Object.keys(this.constraints)
      .filter(key => this.constraints[key])
      .join(', ');
    return `${this.name} ${this.type}${constraints ? ` [${constraints}]` : ''}`;
  }
}

module.exports = Column;