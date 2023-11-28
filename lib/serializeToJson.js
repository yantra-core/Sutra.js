export default function serializeToJson() {
  const serializedData = {
    tree: this.tree,
    conditions: {}
  };

  // Serialize the DSL part of conditions correctly
  for (const key in this.conditions) {
    if (typeof this.conditions[key] === 'function') {
      // Check if it's a DSL definition stored in addCondition
      serializedData.conditions[key] = typeof this.conditions[key].original === 'object'
        ? this.conditions[key].original
        : { type: 'customFunction' };
    }
  }

  return JSON.stringify(serializedData, null, 2);
}