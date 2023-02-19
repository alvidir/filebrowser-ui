import { Warning } from "@/domain/warning";

class WarningController {
  private warnings: Array<Warning> = [];

  pushWarning(warning: Warning): void {
    this.warnings.push(warning);
  }

  removeWarning(warning: Warning): void {
    this.warnings.splice(this.warnings.indexOf(warning), 1);
  }

  getWarnings(): Array<Warning> {
    return this.warnings;
  }
}

export default WarningController;
