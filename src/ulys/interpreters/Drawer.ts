import Node, {
  NodeVisitor,
  Concept,
  Group,
  Text,
  Arrow,
  Row,
  Column,
  Grid
} from '../Node';
import Shape from '../../shapes/Shape';
import { v4 } from 'uuid';
import { RECT_WIDTH, RECT_HEIGHT } from '../../shapes/Rect';

const id = () => `id-${v4()}`;

class Drawer implements NodeVisitor<Shape[]> {
  draw(node: Node): Shape[] {
    return node.accept(this);
  }

  visitArrowNode(node: Arrow): Shape[] {
    const left = this.draw(node.left);
    const right = this.draw(node.right);
    const arrow = {
      type: 'arrow',
      id: id(),
      x1: 200,
      y1: 200,
      x2: 300,
      y2: 300,
      left: true,
      right: false
    };

    return [...left, arrow, ...right] as Shape[];
  }

  visitConceptNode(node: Concept): Shape[] {
    return [
      {
        type: 'rect',
        id: id(),
        text: node.description,
        x: RECT_WIDTH * node.column,
        y: RECT_HEIGHT * node.row
      }
    ];
  }

  visitGroupNode(node: Group): Shape[] {
    return [
      {
        type: 'rect',
        id: id(),
        text: '',
        x: RECT_WIDTH * node.column,
        y: RECT_HEIGHT * node.row
      }
    ];
  }

  visitTextNode(node: Text): Shape[] {
    return [
      {
        type: 'text',
        id: id(),
        text: 'booga',
        x: RECT_WIDTH * node.column,
        y: RECT_HEIGHT * node.row
      }
    ];
  }

  visitRowNode(node: Row): Shape[] {
    const expression = node.expression;
    if (expression === null) {
      return [];
    } else {
      return this.draw(expression);
    }
    // return [{ type: 'row', id: id(), y: 20 }];
  }

  visitColumnNode(node: Column): Shape[] {
    return node.rows.flatMap(r => this.draw(r));
  }

  visitGridNode(node: Grid): Shape[] {
    return node.columns.flatMap(c => this.draw(c));
  }
}

export default Drawer;
