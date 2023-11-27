export default function exportToEnglish(indentLevel = 0) {
  const describeAction = (node, indentLevel) => {
    const currentIndent = ' '.repeat(indentLevel * 4);
    const nextIndent = ' '.repeat((indentLevel + 1) * 4);

    if (node.action) {
      return `${currentIndent}'${node.action}'`;
    } else if (node.if) {
      let description = `${currentIndent}if ${node.if}`;

      if (node.then) {
        const thenDescription = node.then.map(childNode => describeAction(childNode, indentLevel + 1)).join('\n');
        description += ` then\n${thenDescription}`;
      }

      if (node.else) {
        const elseDescription = node.else.map(childNode => describeAction(childNode, indentLevel + 1)).join('\n');
        description += `\n${currentIndent}else\n${elseDescription}`;
      }

      return description;
    }
    return '';
  };

  return this.tree.map(node => describeAction(node, indentLevel)).join('.\n').concat('.');
}
