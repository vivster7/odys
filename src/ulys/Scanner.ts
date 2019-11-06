import Token from './Token';
import TokenType from './TokenType';
import Ulys from './Ulys';

// Single char -> token
const charTokenMap: { [key: string]: TokenType } = {
  '[': TokenType.LEFT_BRACKET,
  ']': TokenType.RIGHT_BRACKET,
  ',': TokenType.COMMA,
  '←': TokenType.LEFT_ARROW,
  '↑': TokenType.UP_ARROW,
  '→': TokenType.RIGHT_ARROW,
  '↓': TokenType.DOWN_ARROW,
  '↔': TokenType.LEFT_RIGHT_ARROW,
  '↕': TokenType.UP_DOWN_ARROW,
  '↖': TokenType.LEFT_UP_ARROW,
  '↗': TokenType.RIGHT_UP_ARROW,
  '↘': TokenType.RIGHT_DOWN_ARROW,
  '↙': TokenType.LEFT_DOWN_ARROW
};

/* Scans code and produces list of tokens. */
class Scanner {
  source: String;
  tokens: Token[] = [];

  start = 0;
  current = 0;
  line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scan(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();
    if (charTokenMap.hasOwnProperty(c)) {
      return this.addToken(charTokenMap[c]);
    }

    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.addToken(TokenType.NEWLINE);
        this.line++;
        break;

      case '"':
        this.string();
        break;

      case '@':
        this.at_reference();
        break;

      case '<':
        if (this.match('-')) {
          if (this.match('>')) {
            this.addToken(TokenType.LEFT_RIGHT_ARROW);
            break;
          } else {
            this.addToken(TokenType.LEFT_ARROW);
            break;
          }
        } else {
          Ulys.error(
            this.line,
            "Unexpected character. '<' must be followed by '-'."
          );
          break;
        }
      case '-':
        if (this.match('>')) {
          this.addToken(TokenType.RIGHT_ARROW);
          break;
        } else {
          Ulys.error(
            this.line,
            "Unexpected character. '-' must be followed by '>'"
          );
          break;
        }
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          this.chompToEndOfLine();
        } else {
          Ulys.error(this.line, 'Unexpected character.');
        }
        break;
      case '\\':
        if (this.match('\\')) {
          this.addToken(TokenType.DOUBLE_BACKSLASH);
        } else {
          this.addToken(TokenType.BACKSLASH);
        }

        const line = this.chompToEndOfLine();
        if (line.trim() !== '') {
          Ulys.error(
            this.line,
            "Tokens ignored. Cannot have tokens after '\\' or '\\\\"
          );
        }
        break;
      default:
        if (this.isAlphaNumeric(c)) {
          this.concept();
        } else {
          Ulys.error(this.line, 'Unexpected character.');
        }
        break;
    }
  }

  private concept(): void {
    while (this.isAlphaNumericWithSpaces(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    this.addToken(TokenType.CONCEPT, text);
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Ulys.error(this.line, 'Unterminated string');
      return;
    }

    // Capture the closing '"'
    this.advance();

    // Remove surrounding " from value
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private at_reference(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Remove the preceding '@' symbol
    const value = this.source.substring(this.start + 1, this.current);
    this.addToken(TokenType.AT_REFERENCE, value);
  }

  private addToken(type: TokenType, literal?: any): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private advance(): string {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  private chompToEndOfLine(): string {
    let line = '';
    while (!this.match('\n') && !this.isAtEnd()) {
      line += this.advance();
    }
    this.line++;
    return line;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAlphaNumericWithSpaces(c: string): boolean {
    return this.isAlphaNumeric(c) || c === ' ';
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }
}

export default Scanner;
