import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import { Subject } from "@/controllers/observer";
import { FieldController } from "vue-fields/src/main";

interface FilebrowserClient {
  searchDirectoryFile(search: string): Promise<Array<FileData>>;
}

interface WarningController {
  pushWarning(warning: Warning): void;
}

class SearchController extends Subject {
  private debounce = 300;
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private items = new Array<FileData>();

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    super();

    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  search = (ctrl: FieldController) => {
    if (!ctrl.value()) {
      this.items = [];
      this.broadcast();
      return;
    }

    this.filebrowserClient
      .searchDirectoryFile(ctrl.value())
      .then((items) => {
        this.items = items;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.pushWarning(error);
      });
  };

  getItems = (): Array<FileData> => {
    return this.items;
  };

  getDebounce = (): number => {
    return this.debounce;
  };
}

export default SearchController;
