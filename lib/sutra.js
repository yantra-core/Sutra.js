import exportToEnglish from "./exportToEnglish.js";
import serializeToJson from "./serializeToJson.js";
import evaluateCondition from "./evaluateCondition.js";
import evaluateSingleCondition from "./evaluateSingleCondition.js";
import evaluateDSLCondition from "./evaluateDSLCondition.js";
import evaluateCompositeCondition from "./evaluateCompositeCondition.js";
import parsePath from "./parsePath.js";
import operatorAliases from "./operatorAliases.js";

let logger = function () { };
// logger = console.log.bind(console);

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};

    this.operators = [
      'equals',
      'notEquals',
      'greaterThan',
      'lessThan',
      'greaterThanOrEqual',
      'lessThanOrEqual',
      'and',
      'or',
      'not'
    ];

    this.operatorAliases = operatorAliases;
    this.exportToEnglish = exportToEnglish;
    this.serializeToJson = serializeToJson;
    this.evaluateCondition = evaluateCondition;
    this.evaluateSingleCondition = evaluateSingleCondition;
    this.evaluateDSLCondition = evaluateDSLCondition;
    this.evaluateCompositeCondition = evaluateCompositeCondition;
    this.parsePath = parsePath;
    this.nodeIdCounter = 0; // New property to keep track of node IDs
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event, ...args) {
    // Trigger all listeners for this specific event
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
    // Trigger all 'any' listeners, regardless of the event type
    if (this.anyListeners) {
      this.anyListeners.forEach(listener => listener(event, ...args));
    }
  }

  onAny(listener) {
    // Initialize the anyListeners array if it doesn't exist
    this.anyListeners = this.anyListeners || [];
    this.anyListeners.push(listener);
  }

  addAction(node) {
    this.tree.push(node);
    this.generateSutraPath(node, 'tree', this.tree.length - 1, null);
  }

  addCondition(name, conditionObj) {
    this.originalConditions = this.originalConditions || {};
    if (Array.isArray(conditionObj)) {
      this.conditions[name] = conditionObj.map(cond => {
        if (typeof cond === 'function') {
          this.originalConditions[name] = this.originalConditions[name] || [];
          this.originalConditions[name].push({ type: 'function', func: cond });
          return { func: (data, gameState) => cond(data, gameState), original: null };
        } else {
          this.originalConditions[name] = this.originalConditions[name] || [];
          this.originalConditions[name].push(cond);
          const conditionFunc = (data, gameState) => this.evaluateDSLCondition(cond, data, gameState);
          return { func: conditionFunc, original: cond };
        }
      });
    } else {
      this.storeSingleCondition(name, conditionObj);
    }
  }

  removeCondition(name) {
    if (this.conditions[name]) {
      delete this.conditions[name];
      if (this.originalConditions && this.originalConditions[name]) {
        delete this.originalConditions[name];
      }
      return true;
    }
    return false; // Condition name not found
  }

  updateCondition(name, newConditionObj) {
    if (!this.conditions[name]) {
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
        const conditionFunc = (data, gameState) => this.evaluateDSLCondition(newConditionObj, data, gameState);
        conditionFunc.original = newConditionObj;
        this.conditions[name] = conditionFunc;
      }
    } else {
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
      // Store composite conditions directly
      this.conditions[name] = conditionObj;
      this.originalConditions[name] = conditionObj;
    } else if (typeof conditionObj === 'function') {
      // Wrap custom function conditions to include gameState
      this.conditions[name] = function (data, gameState) {
        let val = false;
        try {
          val = conditionObj(data, gameState);
        } catch (err) {
          // console.log('warning: error in condition function', err)
        }
        return val;
      }
    } else {
      // For DSL conditions, pass gameState to the evaluateDSLCondition function
      const conditionFunc = (data, gameState) => this.evaluateDSLCondition(conditionObj, data, gameState);
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
  traverseNode(node, data, gameState) {
    if (node.action) {
      this.executeAction(node.action, data, node, gameState); // Execute action
    } else {
      // Evaluate the top-level condition
      // const conditionMet = node.if ? this.evaluateCondition(node.if, data) : true;
      const conditionMet = node.if ? this.evaluateCondition(node.if, data, gameState) : true;
      // Process 'then' and 'else' blocks based on the condition
      if (conditionMet) {
        this.processBranch(node.then, data, gameState);
      } else {
        this.processBranch(node.else, data, gameState);
      }
    }
  }

  processBranch(branch, data, gameState) {
    if (Array.isArray(branch)) {
      branch.forEach(childNode => this.traverseNode(childNode, data, gameState));
    }
  }

  executeAction(action, data, node, gameState) {
    // check data to see if any of the keys at the first level are functions
    // if so, execute them and replace the value with the result
    // this is to allow for dynamic data to be passed to the action
    let object = {};
    if (!node.data) {
      node.data = {};
    }

    let entityData = data;

    Object.entries(entityData).forEach(([key, value]) => {
      if (typeof value === 'function') {
        object[key] = value(gameState);
      } else {
        object[key] = value;
      }
    });

    Object.entries(node.data).forEach(([key, value]) => {
      if (typeof value === 'function') {
        object[key] = value(gameState);
      } else {
        object[key] = value;
      }
    });

    let mergedData = object;

    this.emit(action, mergedData, node, gameState);
  }

  updateEntity(entity, updateData, gameState) {
    Object.entries(updateData).forEach(([key, value]) => {
      if (typeof value === 'function') {
        entity[key] = value();
      } else {
        entity[key] = value;
      }
    });
  }

  generateSutraPath(node, parentPath, index, parent) {
    const path = index === -1 ? parentPath : `${parentPath}[${index}]`;
    node.sutraPath = path;
    node.parent = parent; // Set the parent reference

    if (node.then && Array.isArray(node.then)) {
      node.then.forEach((child, idx) => this.generateSutraPath(child, `${path}.then`, idx, node));
    }

    if (node.else && Array.isArray(node.else)) {
      node.else.forEach((child, idx) => this.generateSutraPath(child, `${path}.else`, idx, node));
    }
  }

  getNestedValue(obj, path) {
    const pathArray = this.parsePath(path);
    return pathArray.reduce((current, part) => {
      return current && current[part] !== undefined ? current[part] : undefined;
    }, obj);
  }

  findNode(path) {
    // Remark: findNode is intentionally not recursive / doesn't use visitor pattern
    //         This choice is based on performance considerations
    //         Feel free to create a benchmark to compare the performance of this
    let obj = this;
    const pathArray = this.parsePath(path);

    let current = obj;
    for (const part of pathArray) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  removeNode(path) {
    // Split the path into segments and find the parent node and the index of the node to be removed
    const pathArray = this.parsePath(path);


    let current = this;
    for (let i = 0; i < pathArray.length - 1; i++) {
      const part = pathArray[i];
      if (current[part] === undefined) {
        return; // Node doesn't exist, nothing to remove
      }
      current = current[part];
    }

    const nodeToRemoveIndex = pathArray[pathArray.length - 1];
    if (Array.isArray(current) && typeof nodeToRemoveIndex === 'number') {
      // If current is an array and nodeToRemoveIndex is an index, use splice
      if (current.length > nodeToRemoveIndex) {
        current.splice(nodeToRemoveIndex, 1);

        // Reconstruct the parentPath
        const parentPath = pathArray.slice(0, -1).reduce((acc, curr, idx) => {
          // Append array indices with brackets and property names with dots
          return idx === 0 ? curr : (!isNaN(curr) ? `${acc}[${curr}]` : `${acc}.${curr}`);
        }, '');

        // Update sutraPath for subsequent nodes in the same array
        this.updateSutraPaths(current, nodeToRemoveIndex, parentPath);
      }
    } else if (current[nodeToRemoveIndex] !== undefined) {
      // If it's a regular object property
      delete current[nodeToRemoveIndex];
    }
  }

  updateSutraPaths(nodes, startIndex, parentPath) {
    for (let i = startIndex; i < nodes.length; i++) {
      // Convert dot notation to bracket notation for indices in the parentPath
      const adjustedParentPath = parentPath.replace(/\.(\d+)(?=\[|$)/g, '[$1]');
      this.generateSutraPath(nodes[i], adjustedParentPath, i, nodes[i].parent);
    }
  }


  updateNode(path, newNodeData) {
    const node = this.findNode(path);
    if (node) {
      Object.assign(node, newNodeData);
      return true;
    }
    return false;
  }

  tick(data, gameState = {}) {
    this.tree.forEach(node => this.traverseNode(node, data, gameState));
  }

  getReadableSutraPath(sutraPath) {
    const node = this.findNode(sutraPath);
    if (!node) return 'Invalid path';

    // Recursive function to build the readable path
    const buildPath = (node, path = '') => {
      if (!node.parent) return path;

      const parent = node.parent;
      const part = parent.if ? `${parent.if}` : (parent.action ? `${parent.action}` : 'unknown');
      const newPath = part + (path ? ' and ' + path : '');

      return buildPath(parent, newPath);
    };

    return buildPath(node);
  }

}

export default Sutra;