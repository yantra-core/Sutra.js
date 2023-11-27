import exportToEnglish from "./exportToEnglish.js";

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};
    this.exportToEnglish = exportToEnglish;
  }


  addCondition(name, conditionObj) {
    if (typeof conditionObj === 'function') {
      this.conditions[name] = conditionObj;
    } else {
      const conditionFunc = (data) => this.evaluateDSLCondition(conditionObj, data);
      conditionFunc.original = conditionObj; // Store original DSL object
      this.conditions[name] = conditionFunc;
    }
  }

  evaluateDSLCondition(conditionObj, data) {
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
      // Add logical operators if needed
      // ...
      default:
        return false;
    }
  }


  evaluateCondition(condition, data) {
    if (typeof condition === 'function') {
      return condition(data);
    } else if (typeof condition === 'object') {
      return this.evaluateDSLCondition(condition, data);
    } else {
      return this.conditions[condition] ? this.conditions[condition](data) : false;
    }
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

  // Updated to accept additional parameters for condition evaluation
  evaluateCondition(condition, data) {
    return this.conditions[condition] ? this.conditions[condition](data) : false;
  }

  addAction(node) {
    this.tree.push(node);
  }

  // Updated to pass entity data to condition evaluation
  traverseNode(node, data) {
    if (node.action) {
      this.executeAction(node.action); // Execute action
    } else if (node.if) {
      const conditionMet = this.evaluateCondition(node.if, data);
      if (conditionMet && node.then) {
        node.then.forEach(childNode => this.traverseNode(childNode, data));
      } else if (!conditionMet && node.else) {
        node.else.forEach(childNode => this.traverseNode(childNode, data));
      }
    }
  }

  executeAction(action) {
    // Emit an event when an action is executed
    this.emit('action', action);
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