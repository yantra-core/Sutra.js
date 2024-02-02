export default function evaluateCondition(condition, node, data, gameState, sutra = this) {
  let targetData;
  if (typeof data === 'function') {
    targetData = data(gameState);
  } else {
    targetData = data;
  }

  // Use the provided Sutra's conditions or default to the current Sutra's conditions
  const conditions = sutra.conditions;

  if (typeof condition === 'string') {
    let conditionEntry = sutra.conditions[condition];

    // If not found in the subtree, check in the main Sutra
    if (!conditionEntry) {
      conditionEntry = this.conditions[condition];
    }

    if (!conditionEntry) {
      // if not found, return false ( for now sub-tree issue )
      // return false;
    }

    if (conditionEntry) {
      if (Array.isArray(conditionEntry)) {
        return conditionEntry.every(cond => {
          return typeof cond.func === 'function' ? cond.func(targetData, gameState, node) : sutra.evaluateDSLCondition(cond.original, node, targetData, gameState);
        });
      } else if (['and', 'or', 'not'].includes(conditionEntry.op)) {
        // Handling composite conditions
        return sutra.evaluateCompositeCondition(conditionEntry, node, targetData, gameState);
      } else {
        return sutra.evaluateSingleCondition(conditionEntry, node, targetData, gameState);
      }
    } else {
      console.log('Warning: Condition not found: ' + condition + '. About to throw an error.\nPlease define the missing condition in your sutra script.');
      throw new Error(`Condition "${condition}" not found`);
    }
  } else if (typeof condition === 'function') {
    return condition(targetData, gameState);
  } else if (Array.isArray(condition)) {
    return condition.every(cond => sutra.evaluateCondition(cond, node, targetData, gameState));
  }
  return false;
}
