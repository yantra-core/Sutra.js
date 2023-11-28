export default function evaluateSingleCondition(condition, data) {
  // logger('Evaluating condition', condition, data);

  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];

    if (conditionEntry) {
      // Handle composite conditions
      if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        return this.evaluateCompositeCondition(conditionEntry, data);
      }

      // Handle named function conditions
      if (typeof conditionEntry === 'function') {
        return conditionEntry(data);
      }

      // Handle DSL conditions
      if (typeof conditionEntry.original === 'object') {
        return this.evaluateDSLCondition(conditionEntry.original, data);
      }
    }
  }

  // Handle direct function conditions
  if (typeof condition === 'function') {
    return condition(data);
  }

  // logger('Evaluating unrecognized condition');
  return false;
}
