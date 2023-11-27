// Example language configuration object
const languageConfig = {
  en: { // English
    ifKeyword: "if",
    thenKeyword: "then",
    elseKeyword: "else"
    // Add more keywords or phrases as needed
  },
  zh: { // Mandarin
    ifKeyword: "如果", // Rúguǒ
    thenKeyword: "那么", // Nàme
    elseKeyword: "否则" // Fǒuzé
  },
  ja: { // Japanese
    ifKeyword: "もし", // Moshi
    thenKeyword: "ならば", // Naraba
    elseKeyword: "それ以外" // Sore igai
  },
  // You can add more languages here
};

export default function exportToEnglish(indentLevel = 0, lang = 'en') {
  const langKeywords = languageConfig[lang] || languageConfig.en; // Fallback to English if the language is not found

  const describeAction = (node, indentLevel) => {
    const currentIndent = ' '.repeat(indentLevel * 4);
    const nextIndent = ' '.repeat((indentLevel + 1) * 4);

    if (node.action) {
      return `${currentIndent}'${node.action}'`;
    } else if (node.if) {
      let description = `${currentIndent}${langKeywords.ifKeyword} ${node.if}`;

      if (node.then) {
        const thenDescription = node.then.map(childNode => describeAction(childNode, indentLevel + 1)).join('\n');
        description += ` ${langKeywords.thenKeyword}\n${thenDescription}`;
      }

      if (node.else) {
        const elseDescription = node.else.map(childNode => describeAction(childNode, indentLevel + 1)).join('\n');
        description += `\n${currentIndent}${langKeywords.elseKeyword}\n${elseDescription}`;
      }

      return description;
    }
    return '';
  };

  return this.tree.map(node => describeAction(node, indentLevel)).join('.\n').concat('.');
}
