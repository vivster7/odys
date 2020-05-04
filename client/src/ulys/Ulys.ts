/* unsure */
class Ulys {
  static error(line: number, message: string) {
    this.report(line, message);
  }

  private static report(line: number, message: string) {
    console.error(`[line ${line}] Error: ${message}`);
  }
}

export default Ulys;
