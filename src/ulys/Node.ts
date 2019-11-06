import Token from './Token';
import TokenType from './TokenType';

/* Node objects used as nodes in AST */
abstract class Node {
  row: number = -1;
  column: number = -1;
  abstract accept<R>(visitor: NodeVisitor<R>): R;
}

export interface NodeVisitor<R> {
  visitConceptNode(node: Concept): R;
  visitAtReferenceNode(node: AtReference): R;
  visitTextNode(node: Text): R;
  visitGroupNode(node: Group): R;
  visitArrowNode(node: Arrow): R;
  visitRowNode(node: Row): R;
  visitColumnNode(node: Column): R;
  visitGridNode(node: Grid): R;
}

export class Concept extends Node {
  private isLeaf = true;
  description: string;
  row: number;
  column: number;

  constructor(description: string, row: number, column: number) {
    super();
    this.description = description;
    this.row = row;
    this.column = column;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitConceptNode(this);
  }
}

export class AtReference extends Node {
  private isLeaf = true;
  value: number;
  row: number;
  column: number;

  constructor(value: number, row: number, column: number) {
    super();
    this.value = value;
    this.row = row;
    this.column = column;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitAtReferenceNode(this);
  }
}

export class Text extends Node {
  private isLeaf = true;
  value: string;
  row: number;
  column: number;

  constructor(value: string, row: number, column: number) {
    super();
    this.value = value;
    this.row = row;
    this.column = column;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitTextNode(this);
  }
}

export class Group extends Node {
  private isLeaf = false;
  private expression: Node;
  row: number;
  column: number;

  constructor(expression: Node, row: number, column: number) {
    super();
    this.expression = expression;
    this.row = row;
    this.column = column;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitGroupNode(this);
  }
}

export class Arrow extends Node {
  private isLeaf = false;
  arrow: Token;
  left: Node;
  right: Node;
  row: number;
  column: number;

  constructor(
    left: Node,
    arrow: Token,
    right: Node,
    row: number,
    column: number
  ) {
    super();
    this.left = left;
    this.arrow = arrow;
    this.right = right;
    this.row = row;
    this.column = column;
  }

  isLeft(): boolean {
    const type = this.arrow.type;
    if (
      type === TokenType.LEFT_ARROW ||
      type === TokenType.LEFT_RIGHT_ARROW ||
      type === TokenType.UP_ARROW
    ) {
      return true;
    }
    return false;
  }

  isRight(): boolean {
    const type = this.arrow.type;
    if (
      type === TokenType.RIGHT_ARROW ||
      type === TokenType.LEFT_RIGHT_ARROW ||
      type === TokenType.DOWN_ARROW
    ) {
      return true;
    }
    return false;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitArrowNode(this);
  }
}

export class Row extends Node {
  private isLeaf = false;
  expression: Node | null;

  constructor(expression: Node | null) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitRowNode(this);
  }
}

export class Column extends Node {
  private isLeaf = false;
  rows: Row[];

  constructor(rows: Row[]) {
    super();
    this.rows = rows;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitColumnNode(this);
  }
}

export class Grid extends Node {
  private isLeaf = false;
  columns: Column[];

  constructor(columns: Column[]) {
    super();
    this.columns = columns;
  }

  accept<R>(visitor: NodeVisitor<R>) {
    return visitor.visitGridNode(this);
  }
}

export default Node;
