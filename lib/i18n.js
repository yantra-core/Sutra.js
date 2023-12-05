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

export default languageConfig;