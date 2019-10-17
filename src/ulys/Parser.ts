import Node, { Concept, Arrow, Group, Text, Row, Column, Grid } from './Node';
import TokenType from './TokenType';
import Token from './Token';

/*
Parser constructs AST from Tokens

    Grammar:
        expression  → arrow ;
        arrow       → primary ( ( '->' | '<-' | '<->' | '←' | '↑' | '→' | '↓' | '↔' | '↕' | '↖' | '↗' | '↘' | '↙' ) primary )* ;
        primary     → CONCEPT | STRING | "[" arrow "]"

        row         →  expression? ( NEWLINE | EOF ) ;
        column      →  row+ ( BACKSLASH | EOF ) ;
        grid        →  column+ ( DOUBLE_BACKSLASH | EOF ) ;

        program     → grid EOF? ;
*/

class Parser {
  private tokens: Token[];
  private previous: Token = new Token(TokenType.BOF, '', null, 0);
  private current = 0;
  private rowNumber = 0;
  private colNumber = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Grid {
    return this.grid();
  }

  private expression(): Node {
    return this.arrow();
  }

  private arrow(): Node {
    const arrows = [
      TokenType.LEFT_ARROW,
      TokenType.RIGHT_ARROW,
      TokenType.LEFT_RIGHT_ARROW,
      TokenType.UP_ARROW,
      TokenType.DOWN_ARROW,
      TokenType.UP_DOWN_ARROW,
      TokenType.LEFT_UP_ARROW,
      TokenType.LEFT_DOWN_ARROW,
      TokenType.RIGHT_UP_ARROW,
      TokenType.RIGHT_DOWN_ARROW
    ];

    const left: Node = this.primary();
    if (!this.match(...arrows)) return left;

    do {
      const arrow = this.previous;
      const right: Node = this.primary();
      return new Arrow(left, arrow, right, this.rowNumber, this.colNumber);
    } while (this.match(...arrows));
  }

  private primary(): Node {
    let expr: Node;
    if (this.match(TokenType.RIGHT_BRACKET)) {
      expr = new Group(this.expression(), this.rowNumber, this.colNumber);
      if (this.match(TokenType.LEFT_BRACKET))
        console.error("Missing matching ']'. ");
      // this.consume(TokenType.LEFT_BRACKET, "Mising matching ']'. ")
    } else if (this.match(TokenType.STRING)) {
      expr = new Text(this.previous.literal, this.rowNumber, this.colNumber);
    } else {
      expr = new Concept(this.advance().lexeme, this.rowNumber, this.colNumber);
    }

    return expr;
  }

  private row(): Row {
    this.rowNumber++;
    // Row has no content -- just a newline
    if (this.match(TokenType.NEWLINE)) {
      return new Row(null);
    }

    const expr = this.expression();
    if (this.match(TokenType.NEWLINE) || this.isAtEnd()) {
      return new Row(expr);
    } else {
      // TODO(vivek): error
      console.error(
        `[Parse Error] Expected newline at end of line ${this.peek().line}`
      );
      return new Row(expr);
    }
  }

  private column(): Column {
    this.colNumber++;
    this.rowNumber = 0;

    const rows: Row[] = [];
    do {
      rows.push(this.row());
    } while (
      !this.match(TokenType.BACKSLASH) &&
      this.peek().type !== TokenType.DOUBLE_BACKSLASH &&
      !this.isAtEnd()
    );

    return new Column(rows);
  }

  private grid(): Grid {
    const columns: Column[] = [];
    do {
      columns.push(this.column());
      console.log('x');
    } while (!this.match(TokenType.DOUBLE_BACKSLASH) && !this.isAtEnd());

    return new Grid(columns);
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const tt of tokenTypes) {
      if (this.check(tt)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.previous = this.peek();
      this.current++;
    }
    return this.previous;
  }

  private check(tokenType: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === tokenType;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  // private Token consume(TokenType type, String message) {
  //     if (check(type))
  //         return advance();
  //     throw error(peek(), message);
  // }

  // private ParseError error(Token token, String message) {
  //     Lox.error(token, message);
  //     return new ParseError();
  // }
}

export default Parser;
