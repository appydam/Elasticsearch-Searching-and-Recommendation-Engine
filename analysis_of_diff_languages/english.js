const EnAnalyzer = {
  analyzer: {
    resource_analyzer: {
      type: 'custom',
      char_filter: ['html_strip'],
      tokenizer: 'standard',
      filter: ['lowercase', 'stop', 'asciifolding', 'stemmer', 'synonyms'],
    },
  },
  filter: {
    synonyms: {
      type: 'synonym',
      synonyms_path: 'synonym1.txt',
      // Reference: https://sites.google.com/site/kevinbouge/synonyms-lists
    },
  },
};

module.exports = EnAnalyzer;
