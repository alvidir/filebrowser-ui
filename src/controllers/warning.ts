import Warning from "@/domain/warning";
import { Subject } from "./observer";

class WarningController extends Subject {
  private max = 3;
  private warnings: Array<Warning> = [];

  pushWarning(warning: Warning): void {
    if (this.warnings.length >= this.max) {
      this.warnings.pop();
    }

    this.warnings.unshift(warning);
    this.broadcast();
  }

  removeWarningAt(index: number): void {
    this.warnings.splice(0, 1);
    this.broadcast();
  }

  getWarnings(): Array<Warning> {
    return this.warnings;
  }
}

export default WarningController;
