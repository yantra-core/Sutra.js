import i18n from './i18n.js';

// Custom function to format data in a readable manner
const formatData = (data, indent) => {
  if (typeof data !== 'object' || data === null) {
    return `${indent}${data}`;
  }

  return Object.entries(data).map(([key, value]) => {
    let stringValue = '';

    if (typeof value === 'function') {
      // Get function name from value
      stringValue = `${value.name}()`;
    } else if (typeof value === 'object' && value !== null) {
      // Format nested object
      const nestedIndent = indent + '  ';
      stringValue = `\n${formatData(value, nestedIndent)}`;
    } else {
      // Handle non-object values
      stringValue = value;
    }

    return `${indent}${key}: ${stringValue}`;
  }).join('\n');
};

export default function exportToEnglish(indentLevel = 0, lang = 'en') {
  const langKeywords = i18n[lang] || i18n.en; // Fallback to English if the language is not found

  const describeAction = (node, indentLevel) => {
    const currentIndent = ' '.repeat(indentLevel * 2);
    const nextIndent = ' '.repeat((indentLevel) * 2);
    const withIndent = ' '.repeat(indentLevel * 2 + 2); // Indent for "with" label
    const dataIndent = ' '.repeat((indentLevel + 2) * 2); // Indent for data

    if (node.action) {
      return `${currentIndent}'${node.action}'`;
    } else if (node.if) {
      let description = `${currentIndent}${langKeywords.ifKeyword} ${node.if}`;

      // Process 'then' block
      if (node.then) {
        const thenDescription = node.then.map((childNode) => {
          let childDesc = describeAction(childNode, indentLevel + 1);
          if (childNode.data) {
            childDesc += `\n${formatData(childNode.data, dataIndent)}`;
          }
          return childDesc;
        }).join('\n');
        description += `\n${thenDescription}`;
      }

      // Process 'else' block
      if (node.else) {
        const elseDescription = node.else.map((childNode) => {
          let childDesc = describeAction(childNode, indentLevel + 1);
          if (childNode.data) {
            childDesc += `\n${formatData(childNode.data, dataIndent)}`;
          }
          return childDesc;
        }).join('\n');
        description += `\n${currentIndent}${langKeywords.elseKeyword}\n${elseDescription}`;
      }

      return description;
    }
    return '';
  };

  return this.tree.map(node => describeAction(node, indentLevel)).join('.\n').concat('.');
}
