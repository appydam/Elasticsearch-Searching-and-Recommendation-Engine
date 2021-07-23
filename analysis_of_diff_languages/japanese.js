const JpAnalyzer = {
  analyzer: {
    resource_analyzer: {
      type: 'custom',
      char_filter: ['html_strip', 'icu_normalizer'],
      tokenizer: 'kuromoji_tokenizer',
      filter: [
        'kuromoji_baseform',
        'kuromoji_part_of_speech',
        'cjk_width',
        'ja_stop',
        'kuromoji_stemmer',
        'lowercase',
        'kuromoji_readingform',
        'kuromoji_number',
      ],
    },
  },
};

module.exports = JpAnalyzer;
