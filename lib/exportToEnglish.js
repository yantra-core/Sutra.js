
export default function exportToEnglish(indentLevel = 0) {
  const indent = ' '.repeat(indentLevel * 4); // 4 spaces per indent level

  const describeAction = (node, indentLevel) => {
    const currentIndent = ' '.repeat(indentLevel * 4);
    const nextIndent = ' '.repeat((indentLevel + 1) * 4);

    if (node.action) {
      return `${currentIndent}'${node.action}'`;
    } else if (node.if) {
      const thenPart = node.then ? ` then\n${node.then.map(action => describeAction(action, indentLevel + 1)).join('\n')}` : '';
      const elsePart = node.else ? `\n${currentIndent}else\n${node.else.map(action => describeAction(action, indentLevel + 1)).join('\n')}` : '';
      return `${currentIndent}if ${node.if}${thenPart}${elsePart}`;
    }
    return '';
  };

  return this.tree.map(node => describeAction(node, indentLevel)).join('.\n').concat('.');
}