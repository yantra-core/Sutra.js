export default function evaluateCompositeCondition(conditionObj, node, data, gameState) {
  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  switch (conditionObj.op) {
    case 'and':
      return conditionObj.conditions.every(cond => this.evaluateCondition(cond, node, targetData, gameState));
    case 'or':
      return conditionObj.conditions.some(cond => this.evaluateCondition(cond, node, targetData, gameState));
    case 'not':
      // Assuming 'not' operator has a single condition
      return !this.evaluateCondition(conditionObj.conditions, node, targetData, gameState);
    default:
      return false;
  }
}