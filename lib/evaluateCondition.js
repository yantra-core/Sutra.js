export default function evaluateCondition(condition, data) {
  if (typeof condition === 'string') {
    const conditionEntry = this.conditions[condition];

    if (conditionEntry) {
      if (Array.isArray(conditionEntry)) {
        return conditionEntry.every(cond => {
          return typeof cond.func === 'function' ? cond.func(data) : this.evaluateDSLCondition(cond.original, data);
        });
      } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        // Handling composite conditions
        return this.evaluateCompositeCondition(conditionEntry, data);
      } else {
        return this.evaluateSingleCondition(conditionEntry, data);
      }
    }
  } else if (typeof condition === 'function') {
    return condition(data);
  }

  // logger('Evaluating unrecognized condition');
  return false;
}