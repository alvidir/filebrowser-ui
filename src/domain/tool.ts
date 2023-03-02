import { tools } from "@/domain/details";

class Tool {
  name: string;
  icon = "";
  uri = "";

  constructor(id: string) {
    this.name = id;
  }

  static find = (id: string): Tool => {
    return tools[id] ?? new Tool(id);
  };

  static all = (): Array<Tool> => {
    return Object.values(tools);
  };
}

export default Tool;
