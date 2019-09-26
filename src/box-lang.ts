// https://microsoft.github.io/monaco-editor/monarch.html
const tokensProvider = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',

  keywords: ['->', '<-', '<->'],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-zA-Z_\x80-\xFF][\w\x80-\xFF]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }
      ],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()]/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'operator'
          }
        }
      ],

      // @ annotations.
      [/@\d+/, { token: 'tag', log: 'annotation token: $0' }],

      // delimiter
      [/[;,]/, 'delimiter'],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // strings
      [/"([^"\\]|\\.)*$/, 'invalid.string'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }]
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'], // nested comment
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string: [
      [/[^\\"&]+/, 'string'],
      [/\\"/, 'string.escape'],
      [/&\w+;/, 'string.escape'],
      [/[\\&]/, 'string'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
      [/#.*$/, 'comment']
    ]
  }
};

export default tokensProvider;
