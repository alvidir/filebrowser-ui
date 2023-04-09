import { apps, Details } from "@/domain/details";

class App implements Details {
  name: string;
  icon = "";
  uri = "";

  constructor(id: string) {
    this.name = id;
  }

  static find = (id: string): App => {
    return Object.assign(new App(id), apps[id]);
  };

  static all = (): Array<App> => {
    return Object.values(apps).map((app) => Object.assign(new App(""), app));
  };
}

export default App;
