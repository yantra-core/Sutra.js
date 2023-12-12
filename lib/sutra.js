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
    this.maps = {};

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
    this.toJSON = serializeToJson;
    this.toEnglish = exportToEnglish;
    this.evaluateCondition = evaluateCondition;
    this.evaluateSingleCondition = evaluateSingleCondition;
    this.evaluateDSLCondition = evaluateDSLCondition;
    this.evaluateCompositeCondition = evaluateCompositeCondition;
    this.parsePath = parsePath;
    this.nodeIdCounter = 0; // New property to keep track of node IDs
  }

  use(subSutra, name, insertAt = this.tree.length, shareListeners = true) {
    // Store a reference to the subSutra for subtree-specific logic
    this.subtrees = this.subtrees || {};
    subSutra.isSubtree = true;
    subSutra.parent = this;
    this.subtrees[name] = subSutra;

    if (shareListeners) {
      this.sharedListeners = true;

      // Merge subtree's listeners into the main tree's listeners
      this.listeners = { ...this.listeners, ...subSutra.listeners };
      this.anyListeners = [...(this.anyListeners || []), ...(subSutra.anyListeners || [])];

      // Optionally, update the subtree's listeners to reflect this change
      // This ensures that both the subtree and main tree have the same set of listeners
      subSutra.listeners = this.listeners;
      subSutra.anyListeners = this.anyListeners;
    }

    // Integrate conditions from the subSutra
    Object.entries(subSutra.conditions).forEach(([conditionName, condition]) => {
      if (this.conditions[conditionName]) {
        console.warn(`Condition '${conditionName}' from subtree '${name}' will overwrite an existing condition in the main Sutra.`);
      }
      this.addCondition(conditionName, condition);
    });

    // always combine conditions from subtrees
    subSutra.conditions = { ...this.conditions, ...subSutra.conditions };
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event, ...args) {
    // Emit to the current instance's listeners
    this.emitLocal(event, ...args);

    // If this instance is a subtree and sharedListeners is true, propagate to the parent tree
    if (this.isSubtree && this.sharedListeners && this.parent) {
      this.parent.emitShared(event, ...args);
    }
  }

  emitLocal(event, ...args) {
    // Trigger all listeners for this specific event
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
    // Trigger all 'any' listeners, regardless of the event type
    if (this.anyListeners) {
      this.anyListeners.forEach(listener => listener(event, ...args));
    }
  }

  emitShared(event, ...args) {
    // Emit to main tree's listeners
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
    if (this.anyListeners) {
      this.anyListeners.forEach(listener => listener(event, ...args));
    }
    // Additionally, emit to each subtree's listeners
    Object.values(this.subtrees).forEach(subtree => {
      if (subtree.listeners[event]) {
        subtree.listeners[event].forEach(listener => listener(...args));
      }
      if (subtree.anyListeners) {
        subtree.anyListeners.forEach(listener => listener(event, ...args));
      }
    });
  }

  onAny(listener) {
    // Initialize the anyListeners array if it doesn't exist
    this.anyListeners = this.anyListeners || [];
    this.anyListeners.push(listener);
  }

  if() {
    const conditions = Array.from(arguments); // Convert arguments to an array
    const lastNode = this.tree.length > 0 ? this.tree[this.tree.length - 1] : null;
    if (lastNode && !lastNode.then) {
      // If the last node exists and doesn't have a 'then', add conditions to it
      if (!Array.isArray(lastNode.if)) {
        lastNode.if = [lastNode.if];
      }
      lastNode.if = lastNode.if.concat(conditions);
    } else {
      // Create a new node
      const node = { if: conditions.length > 1 ? conditions : conditions[0] };
      this.addAction(node);
    }
    return this; // Return this for chaining
  }

  // Fluent API for map
  map(name) {
    let lastNode = this.tree[this.tree.length - 1];

    // If there's no last 'then' node or it's a placeholder, create a new node
    if (!lastNode) {
      lastNode = { then: [] };
      // lastNode.then.push(lastThenNode);
    }
    if (!lastNode.then) {
      lastNode.then = [];
    }

    // Add the map node to the last 'then' node
    let mapNode = { map: name };
    lastNode.then.push(mapNode);

    return this; // Allow chaining within the scoped context
  }


  then(actionOrFunction, data = null) {
    const lastNode = this.tree[this.tree.length - 1];
    if (!lastNode.then) {
      lastNode.then = [];
    }

    if (typeof actionOrFunction === 'function') {
      // Create a scoped context
      const scopedContext = {
        if: (condition) => {
          const node = { if: condition, then: [] };
          node.sutraPath = `${lastNode.sutraPath}.then[${lastNode.then.length}]`;
          lastNode.then.push(node);
          return scopedContext; // Allow chaining within the scoped context
        },
        then: (action) => {
          const node = lastNode.then[lastNode.then.length - 1];
          if (!node.then) {
            node.then = [];
          }
          const actionNode = { action: action };
          actionNode.sutraPath = `${node.sutraPath}.then[${node.then.length}]`;
          node.then.push(actionNode);
          return scopedContext;
        },
        else: (action) => {
          const node = lastNode.then[lastNode.then.length - 1];
          if (!node.else) {
            node.else = [];
          }
          const actionNode = { action: action };
          actionNode.sutraPath = `${node.sutraPath}.else[${node.else.length}]`;
          node.else.push(actionNode);
          return scopedContext;
        },
        map: (name) => {

          // Add the map node to the last 'then' node
          let mapNode = { map: name };
          lastNode.then.push(mapNode);

          return scopedContext; // Allow chaining within the scoped context
        }

      };

      // Execute the function in the scoped context
      actionOrFunction(scopedContext);
    } else {
      // Handle string or object argument
      const actionNode = { action: actionOrFunction, data: data };
      actionNode.sutraPath = `${lastNode.sutraPath}.then[${lastNode.then.length}]`;
      lastNode.then.push(actionNode);
    }

    return this; // Return this for chaining
  }

  else(actionOrFunction, data = null) {
    const lastNode = this.tree[this.tree.length - 1];
    if (!lastNode.else) {
      lastNode.else = [];
    }

    if (typeof actionOrFunction === 'function') {
      // Create a scoped context for else
      const scopedContext = {
        if: (condition) => {
          const node = { if: condition, then: [], else: [] };
          lastNode.else.push(node);
          return scopedContext; // Allow chaining within the scoped context
        },
        then: (action) => {
          const node = lastNode.else[lastNode.else.length - 1];
          if (!node.then) {
            node.then = [];
          }
          node.then.push({ action: action, data: data });
          return scopedContext;
        },
        else: (action) => {
          const node = lastNode.else[lastNode.else.length - 1];
          if (!node.else) {
            node.else = [];
          }
          node.else.push({ action: action, data: data });
          return scopedContext;
        }
      };
      // Execute the function in the scoped context
      actionOrFunction(scopedContext);
    } else {
      lastNode.else.push({ action: actionOrFunction, data: data });
    }
    return this; // Return this for chaining
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
      // Handle if newConditionObj is an array
      if (Array.isArray(newConditionObj)) {
        // Update each condition in the array
        newConditionObj.forEach(condition => {
          if (condition.op === 'and' || condition.op === 'or' || condition.op === 'not') {
            // Composite condition for each element in the array
            const conditionFunc = (data, gameState) => this.evaluateDSLCondition(condition, data, gameState);
            conditionFunc.original = condition;
            this.conditions[name] = conditionFunc;
          } else {
            // DSL condition for each element in the array
            const conditionFunc = (data, gameState) => this.evaluateDSLCondition(condition, data, gameState);
            conditionFunc.original = condition;
            this.conditions[name] = conditionFunc;
          }
        });
      } else if (newConditionObj.op === 'and' || newConditionObj.op === 'or' || newConditionObj.op === 'not') {
        // Composite condition
        const conditionFunc = (data, gameState) => this.evaluateDSLCondition(newConditionObj, data, gameState);
        conditionFunc.original = newConditionObj;
        this.conditions[name] = conditionFunc;
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

  addMap(name, mapFunction) {
    const mapNode = { map: name, func: mapFunction };
    this.maps[name] = mapNode;
    this.generateSutraPath(mapNode, 'tree', this.tree.length - 1, null);
  }

  // Method to execute a map node
  executeMap(mapNode, data, gameState) {
    if (typeof mapNode.func === 'function') {
      // Execute the map function and update data and gameState accordingly
      const result = mapNode.func(data, gameState);
      if (result !== undefined) {
        // Update data and gameState if result is returned
        return result;
      }
    }
    return data; // Return original data if no transformation occurred
  }

  traverseNode(node, data, gameState, mappedData = null) {

    if (node.subtree) {
      const subSutra = this.subtrees[node.subtree];
      if (subSutra) {
        const conditionMet = node.if ? this.evaluateCondition(node.if, data, gameState, subSutra) : true;
        if (conditionMet) {
          subSutra.tick(data, gameState);
        }
      } else {
        console.warn(`Subtree '${node.subtree}' not found.`);
      }
      return;
    }

    // Use mappedData if available, otherwise use the original data
    const currentData = mappedData || data;

    // Process the map node if present
    if (node.map) {
      let map = this.maps[node.map];
      if (!map) {
        throw new Error(`Map "${node.map}" not found`);
      }
      const newMappedData = this.executeMap(map, currentData, gameState);
      if (newMappedData !== undefined) {
        mappedData = newMappedData;
      }
    }

    // Execute action if present
    if (node.action) {
      this.executeAction(node.action, mappedData || currentData, node, gameState);
      return;
    }

    const conditionMet = node.if ? this.evaluateCondition(node.if, mappedData || currentData, gameState) : true;
    if (conditionMet) {
      this.processBranch(node.then, mappedData || currentData, gameState, mappedData);
    } else {
      this.processBranch(node.else, mappedData || currentData, gameState, mappedData);
    }

  }


  processBranch(branch, data, gameState, mappedData = null) {
    if (Array.isArray(branch)) {
      branch.forEach(childNode => this.traverseNode(childNode, data, gameState, mappedData));
    }
  }


  executeAction(action, data, node, gameState) {
    let object = {};
    if (!node.data) {
      node.data = {};
    }

    let entityData = data;

    Object.entries(entityData).forEach(([key, value]) => {
      // check data to see if any of the keys at the first level are functions
      // if so, execute them and replace the value with the result
      // this is to allow for dynamic data to be passed to the action
      if (typeof value === 'function') {
        object[key] = value(entityData, gameState, node);
      } else {
        object[key] = value;
      }
    });

    Object.entries(node.data).forEach(([key, value]) => {
      if (typeof value === 'function') {
        object[key] = value(entityData, gameState, node);
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
    let subtreeEvaluated = false;
    // Iterate over the main tree's nodes
    this.tree.forEach(node => {
      if (node.subtree) {
        subtreeEvaluated = true;
        this.traverseNode(node, data, gameState);
      } else {
        this.traverseNode(node, data, gameState);
      }
    });

    // If no subtrees were directly evaluated in the main tree, then evaluate all subtrees
    if (this.subtrees && !subtreeEvaluated) {
      Object.values(this.subtrees).forEach(subSutra => {
        subSutra.tick(data, gameState);
      });
    }
  }

  getSubtree(subtreeName) {
    return this.subtrees[subtreeName];
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