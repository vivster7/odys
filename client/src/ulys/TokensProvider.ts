// https://microsoft.github.io/monaco-editor/monarch.html

const tokensProvider = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: 'invalid',

  keywords: [
    '->',
    '<-',
    '<->',
    '←',
    '↑',
    '→',
    '↓',
    '↔',
    '↕',
    '↖',
    '↗',
    '↘',
    '↙',
    '\\',
    '\\\\'
  ],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*/^%]+/,

  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.bracket' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' }
  ],

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // keywords
      [
        /[←↑→↓↔↕↖↗↘↙]|<->|<-|->|\\|\\\\/,
        {
          cases: {
            '@keywords': {
              cases: {
                '<->': 'keyword.leftright',
                '<-': 'keyword.left',
                '->': 'keyword.right',
                '←': 'keyword.left',
                '↑': 'keyword.up',
                '→': 'keyword.right',
                '↓': 'keyword.down',
                '↔': 'keyword.leftright',
                '↕': 'keyword.updown',
                '↖': 'keyword.leftup',
                '↗': 'keyword.rightup',
                '↘': 'keyword.rightdown',
                '↙': 'keyword.leftdown',
                '\\$': 'keyword.column-delimiter',
                '\\\\$': 'keyword.table-end'
              }
            },
            '@default': 'identifier'
          }
        }
      ],

      // identifiers
      [/[a-zA-Z_\x80-\xFF][\w\x80-\xFF]*/, 'identifier'],

      // whitespace
      { include: '@whitespace' },

      // brackets
      [/\[/, { token: 'delimiter.square.left', bracket: '@open' }],
      [/]/, { token: 'delimiter.square.right', bracket: '@close' }],
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
      [/@\d+/, { token: 'variable.name', log: 'annotation token: $0' }],

      // delimiter
      [/[,]/, 'delimiter.comma'],

      // numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // strings
      [/"([^"\\]|\\.)*$/, 'invalid.string'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }]
    ],

    // brackets: [
    //   ['{', 'delimiter.curly.left'],
    //   ['}', 'delimiter.curly.right'],
    //   ['[', 'delimiter.square.left'],
    //   [']', 'delimiter.square.right'],
    //   ['(', 'delimiter.parenthesis.left'],
    //   [')', 'delimiter.parenthesis.right'],
    // ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'], // nested comment
      ['\\*/', 'comment', '@pop'],
      [/[/*]/, 'comment']
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
