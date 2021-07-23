const DeAnalyzer = {
  analyzer: {
    resource_analyzer: {
      type: 'custom',
      char_filter: ['html_strip'],
      tokenizer: 'standard',
      filter: [
        'lowercase',
        'dutch_override',
        'dutch_stop',
        'dutch_keywords',
        'dutch_stemmer',
      ],
    },
  },
  filter: {
    dutch_stop: {
      type: 'stop',
      stopwords: '_dutch_',
    },
    dutch_keywords: {
      type: 'keyword_marker',
      keywords: ['voorbeeld'],
    },
    dutch_stemmer: {
      type: 'stemmer',
      language: 'dutch',
    },
    dutch_override: {
      type: 'stemmer_override',
      rules: [
        'fiets=>fiets',
        'bromfiets=>bromfiets',
        'ei=>eier',
        'kind=>kinder',
        'calamiteiten=>calamiteit',
        'calamiteit=>calamiteit',
        'konijn=>lindelaan',
      ],
    },
  },
};

module.exports = DeAnalyzer;
