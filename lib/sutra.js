import exportToEnglish from "./exportToEnglish.js";

let logger = function () { };
// logger = console.log.bind(console);

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};

    this.operatorAliases = {
      eq: 'equals',
      '==': 'equals',
      neq: 'notEquals',
      '!=': 'notEquals',
      lt: 'lessThan',
      '<': 'lessThan',
      lte: 'lessThanOrEqual',
      '<=': 'lessThanOrEqual',
      gt: 'greaterThan',
      '>': 'greaterThan',
      gte: 'greaterThanOrEqual',
      '>=': 'greaterThanOrEqual',
      '&&': 'and',
      '||': 'or',
      '!': 'not'
    };

    this.exportToEnglish = exportToEnglish;
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  addAction(node) {
    this.tree.push(node);
  }

  addCondition(name, conditionObj) {
    logger('Adding condition', name, conditionObj);
  
    // Handle array of conditions
    if (Array.isArray(conditionObj)) {
      // Store each condition in the array
      this.conditions[name] = conditionObj.map(cond => {
        if (typeof cond === 'function') {
          return { func: cond, original: null };
        } else {
          const conditionFunc = (data) => this.evaluateDSLCondition(cond, data);
          return { func: conditionFunc, original: cond };
        }
      });
    } else {
      this.storeSingleCondition(name, conditionObj);
    }
  }

  storeSingleCondition(name, conditionObj) {
    // Store the original condition object separately for GUI use
    if (!(typeof conditionObj === 'function' && conditionObj.original)) {
      this.originalConditions = this.originalConditions || {};
      this.originalConditions[name] = conditionObj;
    }
  
    if (conditionObj.op === 'and' || conditionObj.op === 'or' || conditionObj.op === 'not') {
      this.conditions[name] = conditionObj; // Store the composite condition object directly
    } else if (typeof conditionObj === 'function') {
      this.conditions[name] = conditionObj;
    } else {
      const conditionFunc = (data) => this.evaluateDSLCondition(conditionObj, data);
      conditionFunc.original = conditionObj;
      this.conditions[name] = conditionFunc;
    }
  }
  

  evaluateDSLCondition(conditionObj, data) {
    const operator = this.resolveOperator(conditionObj.op);
    switch (operator) {
      case 'lessThan':
        return data[conditionObj.property] < conditionObj.value;
      case 'greaterThan':
        return data[conditionObj.property] > conditionObj.value;
      case 'equals':
        return data[conditionObj.property] === conditionObj.value;
      case 'notEquals':
        return data[conditionObj.property] !== conditionObj.value;
      case 'lessThanOrEqual':
        return data[conditionObj.property] <= conditionObj.value;
      case 'greaterThanOrEqual':
        return data[conditionObj.property] >= conditionObj.value;
      case 'and':
        return conditionObj.conditions.every(cond => this.evaluateDSLCondition(cond, data));
      case 'or':
        return conditionObj.conditions.some(cond => this.evaluateDSLCondition(cond, data));
      case 'not':
        return !this.evaluateDSLCondition(conditionObj.condition, data);
      default:
        return false;
    }
  }

  resolveOperator(operator) {
    return this.operatorAliases[operator] || operator;
  }

  // Method to set or update aliases
  setOperatorAlias(alias, operator) {
    this.operatorAliases[alias] = operator;
  }

  getConditionFunction(name) {
    return this.conditions[name];
  }

  getCondition(name) {
    return this.originalConditions ? this.originalConditions[name] : undefined;
  }
  

  getOperators() {
    return Object.keys(this.operatorAliases);
  }

  evaluateCondition(condition, data) {
    if (typeof condition === 'string') {
      const conditionEntry = this.conditions[condition];
  
      if (conditionEntry) {
        if (Array.isArray(conditionEntry)) {
          return conditionEntry.every(cond => {
            return typeof cond.func === 'function' ? cond.func(data) : this.evaluateDSLCondition(cond.original, data);
          });
        } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
          // Handling composite conditions
          return this.evaluateCompositeCondition(conditionEntry, data);
        } else {
          return this.evaluateSingleCondition(conditionEntry, data);
        }
      }
    } else if (typeof condition === 'function') {
      return condition(data);
    }
  
    logger('Evaluating unrecognized condition');
    return false;
  }
  

  evaluateSingleCondition(condition, data) {
    logger('Evaluating condition', condition, data);

    if (typeof condition === 'string') {
      const conditionEntry = this.conditions[condition];

      if (conditionEntry) {
        // Handle composite conditions
        if (['and', 'or', 'not'].includes(conditionEntry.op)) {
          return this.evaluateCompositeCondition(conditionEntry, data);
        }

        // Handle named function conditions
        if (typeof conditionEntry === 'function') {
          return conditionEntry(data);
        }

        // Handle DSL conditions
        if (typeof conditionEntry.original === 'object') {
          return this.evaluateDSLCondition(conditionEntry.original, data);
        }
      }
    }

    // Handle direct function conditions
    if (typeof condition === 'function') {
      return condition(data);
    }

    logger('Evaluating unrecognized condition');
    return false;
  }


  evaluateCompositeCondition(conditionObj, data) {
    switch (conditionObj.op) {
      case 'and':
        return conditionObj.conditions.every(cond => this.evaluateCondition(cond, data));
      case 'or':
        return conditionObj.conditions.some(cond => this.evaluateCondition(cond, data));
      case 'not':
        // Assuming 'not' operator has a single condition
        return !this.evaluateCondition(conditionObj.condition, data);
      default:
        return false;
    }
  }
  


  // Updated to pass entity data to condition evaluation
  traverseNode(node, data) {
    logger('Traversing node', node, data)
    if (node.action) {
      this.executeAction(node.action, data, node); // Execute action
    } else {
      // Evaluate the top-level condition
      const conditionMet = node.if ? this.evaluateCondition(node.if, data) : true;

      // Process 'then' and 'else' blocks based on the condition
      if (conditionMet) {
        logger('Condition met', node.if, node)
        this.processBranch(node.then, data);
      } else {
        logger('Condition not met', node.if)
        this.processBranch(node.else, data);
      }
    }
  }

  processBranch(branch, data) {
    logger('Processing branch', branch)
    if (Array.isArray(branch)) {
      logger('Branch is array', branch)
      branch.forEach(childNode => this.traverseNode(childNode, data));
    }
  }
  executeAction(action, data, node) {
    // Handle specific action types
    if (action === 'entity::update' && node.data) {
      // Directly use the data object for updating
      this.updateEntity(data, node.data);
    }

    // Emit an event when an action is executed
    this.emit(action, data);

  }

  updateEntity(entity, updateData) {
    // Apply each key-value pair from updateData to the entity
    Object.entries(updateData).forEach(([key, value]) => {
      entity[key] = value;
    });
  }
  serializeToJson() {
    const serializedData = {
      tree: this.tree,
      conditions: {}
    };

    // Serialize the DSL part of conditions correctly
    for (const key in this.conditions) {
      if (typeof this.conditions[key] === 'function') {
        // Check if it's a DSL definition stored in addCondition
        serializedData.conditions[key] = typeof this.conditions[key].original === 'object'
          ? this.conditions[key].original
          : { type: 'customFunction' };
      }
    }

    return JSON.stringify(serializedData, null, 2);
  }

  tick(data) {
    this.tree.forEach(node => this.traverseNode(node, data));
  }


}

export default Sutra;