import { apps, Details } from "@/domain/details";

class App implements Details {
  name: string;
  icon = "";
  uri? = "";

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
