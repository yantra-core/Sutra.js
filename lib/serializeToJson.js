export default function serializeToJson() {
  const serializedData = {
    tree: this.tree.map(node => serializeNode(node)),
    conditions: {}
  };

  // Serialize the DSL part of conditions correctly
  for (const key in this.conditions) {
    if (typeof this.conditions[key] === 'function') {
      serializedData.conditions[key] = typeof this.conditions[key].original === 'object'
        ? this.conditions[key].original
        : { type: 'customFunction' };
    }
  }

  return JSON.stringify(serializedData, null, 2);
}

// Helper function to serialize a single node
function serializeNode(node) {
  const { parent, ...serializedNode } = node; // Exclude the parent property

  // Recursively serialize 'then' and 'else' branches
  if (serializedNode.then && Array.isArray(serializedNode.then)) {
    serializedNode.then = serializedNode.then.map(childNode => serializeNode(childNode));
  }
  if (serializedNode.else && Array.isArray(serializedNode.else)) {
    serializedNode.else = serializedNode.else.map(childNode => serializeNode(childNode));
  }

  return serializedNode;
}
