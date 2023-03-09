import { apps } from "@/domain/details";

class App {
  name: string;
  icon = "";
  uri = "";

  constructor(id: string) {
    this.name = id;
  }

  static find = (id: string): App => {
    return apps[id] ?? new App(id);
  };

  static all = (): Array<App> => {
    return Object.values(apps);
  };
}

export default App;
