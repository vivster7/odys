import Node from './Node';

class Environment {
  values: { [key: number]: Node };
  constructor() {
    this.values = {};
  }

  get(key: number) {
    if (key in this.values) {
      return this.values[key];
    }
    throw new Error(`Cannot find ${key} in Environment`);
  }

  set(key: number, value: Node) {
    this.values[key] = value;
  }
}

export default Environment;
