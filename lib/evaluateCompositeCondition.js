export default function evaluateCompositeCondition(conditionObj, data) {
  switch (conditionObj.op) {
    case 'and':
      return conditionObj.conditions.every(cond => this.evaluateCondition(cond, data));
    case 'or':
      return conditionObj.conditions.some(cond => this.evaluateCondition(cond, data));
    case 'not':
      // Assuming 'not' operator has a single condition
      return !this.evaluateCondition(conditionObj.condition, data);
    default:
      return false;
  }
}