export default function evaluateCompositeCondition(conditionObj, data) {
  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  switch (conditionObj.op) {
    case 'and':
      return conditionObj.conditions.every(cond => this.evaluateCondition(cond, targetData));
    case 'or':
      return conditionObj.conditions.some(cond => this.evaluateCondition(cond, targetData));
    case 'not':
      // Assuming 'not' operator has a single condition
      return !this.evaluateCondition(conditionObj.condition, targetData);
    default:
      return false;
  }
}