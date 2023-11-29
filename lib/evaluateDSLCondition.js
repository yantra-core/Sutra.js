export default function evaluateDSLCondition(conditionObj, data, gameState) {
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
    targetValue = getNestedValue(gameState, conditionObj.gamePropertyPath);
  } else if (conditionObj.gameProperty) {
    // Use gameState for top-level properties
    targetValue = gameState[conditionObj.gameProperty];
  } else {
    // Use data for entity properties
    targetValue = targetData[conditionObj.property];
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
      return conditionObj.conditions.every(cond => this.evaluateDSLCondition(cond, targetData, gameState));
    case 'or':
      return conditionObj.conditions.some(cond => this.evaluateDSLCondition(cond, targetData, gameState));
    case 'not':
      return !this.evaluateDSLCondition(conditionObj.condition, targetData, gameState);
    default:
      return false;
  }
}

function getNestedValue(obj, path) {
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

  return pathArray.reduce((current, part) => {
    return current && current[part] !== undefined ? current[part] : undefined;
  }, obj);
}