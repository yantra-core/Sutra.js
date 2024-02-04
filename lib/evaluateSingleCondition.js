export default function evaluateSingleCondition(condition, data, gameState) {
  // logger('Evaluating condition', condition, data);

  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }

  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];

    if (conditionEntry) {
      // Handle composite conditions
      if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        return this.evaluateCompositeCondition(conditionEntry, targetData, gameState);
      }

      // Handle named function conditions
      if (typeof conditionEntry === 'function') {
        return conditionEntry(targetData, gameState); // Pass gameState here
      }

      // Handle DSL conditions
      if (typeof conditionEntry.original === 'object') {
        return this.evaluateDSLCondition(conditionEntry.original, targetData, gameState); // Pass gameState here
      }
    }
  }

  // Handle direct function conditions
  if (typeof condition === 'function') {
    return condition(targetData, gameState); // Pass gameState here
  }

  // Handle if condition is array of conditions
  /* Remark: needs tests before we should add this, may be working already
  if (Array.isArray(condition)) {
    return condition.every(cond => this.evaluateCondition(cond, targetData, gameState)); // Pass gameState here
  }
  */

  // logger('Evaluating unrecognized condition');
  return false;
}
