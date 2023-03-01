import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import Subject from "@/controllers/observer";
import { FieldController } from "vue-fields/src/main";

interface FilebrowserClient {
  search(search: string): Promise<Array<FileData>>;
}

interface WarningController {
  push(warning: Warning): void;
}

class SearchController extends Subject {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private items = new Array<FileData>();

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    super();

    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  search = (search: string) => {
    if (!search) {
      this.items = [];
      this.broadcast();
      return;
    }

    this.filebrowserClient
      .search(search)
      .then((items) => {
        this.items = items;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  getItems = (): Array<FileData> => {
    return this.items;
  };
}

export default SearchController;
