import exportToEnglish from "./exportToEnglish.js";

let logger = function () { };
// logger = console.log.bind(console);

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};
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
    // Check if conditionObj is a composite condition (and, or, not)
    if (conditionObj.operator === 'and' || conditionObj.operator === 'or' || conditionObj.operator === 'not') {
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
    logger('Evaluating DSL condition', conditionObj, data)
    switch (conditionObj.operator) {
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
        return conditionObj.conditions.every(cond => this.evaluateCondition(cond, data));
      case 'or':
        return conditionObj.conditions.some(cond => this.evaluateCondition(cond, data));
      case 'not':
        return !this.evaluateCondition(conditionObj.condition, data);
      default:
        return false;
    }
  }

  evaluateCondition(condition, data) {
    logger('Evaluating condition', condition, data);

    if (typeof condition === 'string') {
      const conditionEntry = this.conditions[condition];

      if (conditionEntry) {
        // Handle composite conditions
        if (['and', 'or', 'not'].includes(conditionEntry.operator)) {
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
    switch (conditionObj.operator) {
      case 'and':
        return conditionObj.conditions.every(cond => this.evaluateCondition(cond, data));
      case 'or':
        return conditionObj.conditions.some(cond => this.evaluateCondition(cond, data));
      case 'not':
        // The 'not' operator should have only one condition in the array
        return !this.evaluateCondition(conditionObj.condition, data);
        break;
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
    console.log('executeAction', action, data)
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