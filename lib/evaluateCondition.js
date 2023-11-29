export default function evaluateCondition(condition, data, gameState) {
  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];
    if (conditionEntry) {
      if (Array.isArray(conditionEntry)) {
        return conditionEntry.every(cond => {
          return typeof cond.func === 'function' ? cond.func(data) : this.evaluateDSLCondition(cond.original, data, gameState);
        });
      } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        // Handling composite conditions
        return this.evaluateCompositeCondition(conditionEntry, data, gameState);
      } else {
        return this.evaluateSingleCondition(conditionEntry, data, gameState);
      }
    }
  } else if (typeof condition === 'function') {
    return condition(data, gameState);
  }
  return false;
}