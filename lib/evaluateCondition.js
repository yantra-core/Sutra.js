export default function evaluateCondition(condition, data, gameState) {
  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }
  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];
    if (conditionEntry) {
      if (Array.isArray(conditionEntry)) {
        return conditionEntry.every(cond => {
          return typeof cond.func === 'function' ? cond.func(targetData) : this.evaluateDSLCondition(cond.original, targetData, gameState);
        });
      } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        // Handling composite conditions
        return this.evaluateCompositeCondition(conditionEntry, targetData, gameState);
      } else {
        return this.evaluateSingleCondition(conditionEntry, targetData, gameState);
      }
    }
  } else if (typeof condition === 'function') {
    return condition(targetData, gameState);
  }
  return false;
}