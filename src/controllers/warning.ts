import Warning from "@/domain/warning";
import Subject from "@/controllers/observer";

class WarningController extends Subject {
  private max = 3;
  private warnings = new Array<Warning>();

  push(warning: Warning): void {
    if (this.warnings.length >= this.max) {
      this.warnings.pop();
    }

    this.warnings.unshift(warning);
    this.broadcast();
  }

  remove(index: number): void {
    this.warnings.splice(index, 1);
    this.broadcast();
  }

  all(): Array<Warning> {
    return this.warnings;
  }
}

export default WarningController;
