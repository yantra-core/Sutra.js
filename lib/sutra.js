import exportToEnglish from "./exportToEnglish.js";
import serializeToJson from "./serializeToJson.js";
import evaluateCondition from "./evaluateCondition.js";
import evaluateSingleCondition from "./evaluateSingleCondition.js";
import evaluateDSLCondition from "./evaluateDSLCondition.js";
import evaluateCompositeCondition from "./evaluateCompositeCondition.js";
import operatorAliases from "./operatorAliases.js";

let logger = function () { };
// logger = console.log.bind(console);

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};

    this.operatorAliases = operatorAliases;

    this.exportToEnglish = exportToEnglish;
    this.serializeToJson = serializeToJson;
    this.evaluateCondition = evaluateCondition;
    this.evaluateSingleCondition = evaluateSingleCondition;
    this.evaluateDSLCondition = evaluateDSLCondition;
    this.evaluateCompositeCondition = evaluateCompositeCondition;

    this.nodeIdCounter = 0; // New property to keep track of node IDs

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
    this.generateSutraPath(node, 'tree', this.tree.length - 1);
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

  updateCondition(name, newConditionObj) {
    if (!this.conditions[name]) {
      logger(`Condition '${name}' not found.`);
      return false;
    }

    // If the new condition is a function, update directly
    if (typeof newConditionObj === 'function') {
      this.conditions[name] = newConditionObj;
    } else if (typeof newConditionObj === 'object') {
      // If it's a DSL or composite condition, handle accordingly
      if (newConditionObj.op === 'and' || newConditionObj.op === 'or' || newConditionObj.op === 'not') {
        // Composite condition
        this.conditions[name] = newConditionObj;
      } else {
        // DSL condition
        const conditionFunc = (data) => this.evaluateDSLCondition(newConditionObj, data);
        conditionFunc.original = newConditionObj;
        this.conditions[name] = conditionFunc;
      }
    } else {
      logger(`Invalid condition type for '${name}'.`);
      return false;
    }

    // Update original conditions for GUI use
    this.originalConditions[name] = newConditionObj;
    return true;
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
    this.emit(action, data, node);

  }

  updateEntity(entity, updateData) {
    // Apply each key-value pair from updateData to the entity
    Object.entries(updateData).forEach(([key, value]) => {
      entity[key] = value;
    });
  }
  // New method to generate a unique sutraPath for each node
  generateSutraPath(node, parentPath = 'tree', index = -1) {
    const path = index === -1 ? parentPath : `${parentPath}[${index}]`;
    node.sutraPath = path;

    if (node.then && Array.isArray(node.then)) {
      node.then.forEach((child, idx) => this.generateSutraPath(child, `${path}.then`, idx));
    }

    if (node.else && Array.isArray(node.else)) {
      node.else.forEach((child, idx) => this.generateSutraPath(child, `${path}.else`, idx));
    }
  }
  
  findNode(path) {
    let obj = this;
    const pathArray = path.split('.').reduce((acc, part) => {
      const arrayMatch = part.match(/([^\[]+)(\[\d+\])?/);
      if (arrayMatch) {
        acc.push(arrayMatch[1]);
        if (arrayMatch[2]) {
          acc.push(arrayMatch[2].replace(/[\[\]]/g, ''));
        }
      }
      return acc;
    }, []);

    let current = obj;
    for (const part of pathArray) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  // Method to update a node in the tree based on a unique identifier or path
  updateNode(path, newNodeData) {
    const node = this.findNode(path);
    if (node) {
      // Update the node data here
      // This might involve merging newNodeData with the existing node data
      Object.assign(node, newNodeData);
      return true;
    }
    return false;
  }


  tick(data) {
    this.tree.forEach(node => this.traverseNode(node, data));
  }


}

export default Sutra;