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
  let conditionDescriptions = '';

  const describeAction = (node, indentLevel) => {

    const currentIndent = ' '.repeat(indentLevel * 2);
    const nextIndent = ' '.repeat((indentLevel) * 2);
    const withIndent = ' '.repeat(indentLevel * 2 + 2); // Indent for "with" label
    const dataIndent = ' '.repeat((indentLevel + 2) * 2); // Indent for data

    let output = '';

    if (node.action) {
      return `${currentIndent}${node.action}`;
    } else if (node.if) {
      let ifString;
      if (Array.isArray(node.if)) {
        ifString = node.if.join(` ${langKeywords.andKeyword} `);

      } else {
        ifString = node.if;
      }
      let description = `${currentIndent}${langKeywords.ifKeyword} ${ifString}`;

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

      output += description;
    }

    if (node.subtree) {
      const subtree = this.subtrees[node.subtree];
      if (subtree) {
        // Recursively call exportToEnglish for the subtree
        output += `${currentIndent} @${node.subtree}=>\n${exportToEnglish.call(subtree, indentLevel + 1, lang)}`;
      }
      // If the subtree is not found, return a placeholder message
      // output += `${currentIndent}${langKeywords.subtreeKeyword} ${node.subtree} (not found)`;
    }

    // Combine actions and conditions descriptions
    //let output = this.tree.map(node => describeAction(node, indentLevel, this)).join('\n');
    // Remark: this will expand *all conditions* inline, which is not ideal, but useful as a config setting
    /*
    for (let c in this.originalConditions) {
      let condition = this.originalConditions[c];
      output += `\n\n${c}:\n  ${describeCondition(condition)}`;
    }
    */

    // Add an extra newline for root nodes
    if (indentLevel === 0) {
      output += '\n';
    }


    return output;

  };

  const describeCondition = (condition) => {
    // Handle condition if it's a function
    if (typeof condition === 'function') {
      return condition.toString();
    }

    // Handle condition if it's an array of conditions
    if (Array.isArray(condition)) {
      return condition.map(cond => describeCondition(cond)).join(' and ');
    }

    // Handle condition if it's an object
    if (typeof condition === 'object' && condition !== null) {
      switch (condition.op) {
        case 'eq':
          return `${condition.property} equals ${condition.value}`;
        case 'lessThan':
          return `${condition.property} less than ${condition.value}`;
        case 'greaterThan':
          return `${condition.property} greater than ${condition.value}`;
        case 'and':
          return `all of (${condition.conditions.map(cond => describeCondition(cond)).join(', ')}) are true`;
        case 'or':
          return `any of (${condition.conditions.map(cond => describeCondition(cond)).join(', ')}) is true`;
        case 'not':
          return `not (${describeCondition(condition.conditions)})`;
        // Add more cases as needed for other operators
        default:
          // console.log('calling default', condition)
          return JSON.stringify(condition);
      }
    }

    return JSON.stringify(condition);
  };



  return this.tree.map(node => describeAction(node, indentLevel)).join('\n').concat('') + '\n' + conditionDescriptions;
}