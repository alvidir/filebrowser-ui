import Warning from "@/domain/warning";
import Subject from "@/controllers/observer";
import SearchMatch from "@/domain/search";

interface FilebrowserClient {
  searchFile(search: string): Promise<Array<SearchMatch>>;
}

interface WarningController {
  push(warning: Warning): void;
}

class SearchController extends Subject {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private items = new Array<SearchMatch>();

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
      .searchFile(search)
      .then((items) => {
        this.items = items;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  getItems = (): Array<SearchMatch> => {
    return this.items;
  };
}

export default SearchController;
