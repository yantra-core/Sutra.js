import exportToEnglish from "./exportToEnglish.js";

class Sutra {
  constructor() {
    this.tree = [];
    this.conditions = {};
    this.listeners = {};
    this.exportToEnglish = exportToEnglish;
  }

  addCondition(name, func) {
    this.conditions[name] = func;
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
    return JSON.stringify(this.tree, null, 2);
  }

  // Updated to accept entity data
  tick(data) {
    this.tree.forEach(node => this.traverseNode(node, data));
  }

  

}

export default Sutra;