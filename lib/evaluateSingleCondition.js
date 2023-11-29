export default function evaluateSingleCondition(condition, data, gameState) {
  // logger('Evaluating condition', condition, data);

  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];

    if (conditionEntry) {
      // Handle composite conditions
      if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        return this.evaluateCompositeCondition(conditionEntry, data, gameState);
      }

      // Handle named function conditions
      if (typeof conditionEntry === 'function') {
        return conditionEntry(data, gameState); // Pass gameState here
      }

      // Handle DSL conditions
      if (typeof conditionEntry.original === 'object') {
        return this.evaluateDSLCondition(conditionEntry.original, data, gameState); // Pass gameState here
      }
    }
  }

  // Handle direct function conditions
  if (typeof condition === 'function') {
    return condition(data, gameState); // Pass gameState here
  }

  // logger('Evaluating unrecognized condition');
  return false;
}
