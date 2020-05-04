import TokenType from './TokenType';

class Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;

  // TODO (vivek): add Offset
  constructor(type: TokenType, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }
}

export default Token;
