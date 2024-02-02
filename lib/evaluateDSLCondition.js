export default function evaluateDSLCondition(conditionObj, node, data, gameState) {
  const operator = this.resolveOperator(conditionObj.op);

  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }

  let targetValue;

  if (conditionObj.gamePropertyPath) {
    // Use getNestedValue for deeply nested properties in gameState
    targetValue = this.getNestedValue(gameState, conditionObj.gamePropertyPath);
  } else if (conditionObj.gameProperty) {
    // Use gameState for top-level properties
    targetValue = gameState[conditionObj.gameProperty];
  } else {
    // Use data for entity properties
    targetValue = targetData[conditionObj.property];
  }

  if (typeof targetValue === 'undefined') {
    targetValue = 0;
  }

  switch (operator) {
    case 'lessThan':
      return targetValue < conditionObj.value;
    case 'greaterThan':
      return targetValue > conditionObj.value;
    case 'equals':
      return targetValue === conditionObj.value;
    case 'notEquals':
      return targetValue !== conditionObj.value;
    case 'lessThanOrEqual':
      return targetValue <= conditionObj.value;
    case 'greaterThanOrEqual':
      return targetValue >= conditionObj.value;
    case 'and':
      return conditionObj.conditions.every(cond => this.evaluateDSLCondition(cond, node, targetData, gameState));
    case 'or':
      return conditionObj.conditions.some(cond => this.evaluateDSLCondition(cond, node, targetData, gameState));
    case 'not':
      return !this.evaluateDSLCondition(conditionObj.condition, node, targetData, gameState);
    default:
      return false;
  }
}