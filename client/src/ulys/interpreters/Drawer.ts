import Node, {
  NodeVisitor,
  Concept,
  Group,
  Text,
  Arrow,
  Row,
  Column,
  Grid,
  AtReference,
} from '../Node';
import Shape from '../../shapes/Shape';
import { v4 } from 'uuid';
import { RECT_WIDTH, RECT_HEIGHT } from '../../shapes/Rect';
import Environment from '../Environment';

const id = () => `id-${v4()}`;
const X_PADDING = 80;
const Y_PADDING = 50;

const computeBlockX = (columnNumber: number) => {
  return RECT_WIDTH * columnNumber + X_PADDING * columnNumber;
};

const computeBlockY = (rowNumber: number) => {
  return RECT_HEIGHT * rowNumber + Y_PADDING * rowNumber;
};

const computeTextX = (columnNumber: number) => {
  return RECT_WIDTH * columnNumber + RECT_WIDTH / 2 + X_PADDING * columnNumber;
};

const computeTextY = (rowNumber: number) => {
  return RECT_HEIGHT * rowNumber + RECT_HEIGHT / 2 + Y_PADDING * rowNumber;
};

const computeArrowLeftX = (columnNumber: number) => {
  return RECT_WIDTH * columnNumber + RECT_WIDTH + X_PADDING * columnNumber;
};

const computeArrowRightX = (columnNumber: number) => {
  return RECT_WIDTH * columnNumber + X_PADDING * columnNumber;
};

const computeArrowLeftY = (rowNumber: number) => {
  return RECT_HEIGHT * rowNumber + RECT_HEIGHT / 2 + Y_PADDING * rowNumber;
};

const computeArrowRightY = (rowNumber: number) => {
  return RECT_HEIGHT * rowNumber + RECT_HEIGHT / 2 + Y_PADDING * rowNumber;
};

class Drawer implements NodeVisitor<Shape[]> {
  private environment: Environment;
  constructor(environment: Environment) {
    this.environment = environment;
  }

  draw(node: Node): Shape[] {
    return node.accept(this);
  }

  visitArrowNode(node: Arrow): Shape[] {
    const leftReference: AtReference = node.left as AtReference;
    const rightReference: AtReference = node.right as AtReference;

    const leftToken = this.environment.get(leftReference.value);
    const rightToken = this.environment.get(rightReference.value);

    const arrow = {
      type: 'arrow',
      id: id(),
      x1: computeArrowLeftX(leftToken.column),
      y1: computeArrowLeftY(leftToken.row),
      x2: computeArrowRightX(rightToken.column),
      y2: computeArrowRightY(rightToken.row),
      left: node.isLeft(),
      right: node.isRight(),
      isLastUpdatedBySync: false,
    } as Shape;

    return [arrow];
  }

  visitAtReferenceNode(node: AtReference): Shape[] {
    return [];
  }

  visitConceptNode(node: Concept): Shape[] {
    return [
      {
        type: 'rect',
        id: id(),
        text: node.description,
        x: computeBlockX(node.column),
        y: computeBlockY(node.row),
        translateX: 0,
        translateY: 0,
        width: 200,
        height: 100,
        deltaWidth: 0,
        deltaHeight: 0,
      } as any,
    ];
  }

  visitGroupNode(node: Group): Shape[] {
    return [
      {
        type: 'rect',
        id: id(),
        text: '',
        x: computeBlockX(node.column),
        y: computeBlockY(node.row),
        translateX: 0,
        translateY: 0,
        width: 200,
        height: 100,
        deltaWidth: 0,
        deltaHeight: 0,
      } as any,
    ];
  }

  visitTextNode(node: Text): Shape[] {
    return [
      {
        type: 'text',
        id: id(),
        text: node.value,
        x: computeTextX(node.column),
        y: computeTextY(node.row),
        translateX: 0,
        translateY: 0,
      } as any,
    ];
  }

  visitRowNode(node: Row): Shape[] {
    const expression = node.expression;
    if (expression === null) {
      return [];
    } else {
      return this.draw(expression);
    }
  }

  visitColumnNode(node: Column): Shape[] {
    return node.rows.flatMap((r) => this.draw(r));
  }

  visitGridNode(node: Grid): Shape[] {
    return node.columns.flatMap((c) => this.draw(c));
  }
}

export default Drawer;
