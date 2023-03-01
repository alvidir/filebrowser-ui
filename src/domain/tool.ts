import details from "@/domain/details";

class Tool {
  name: string;
  icon = "";
  uri = "";

  constructor(id: string) {
    this.name = id;
  }

  static find = (id: string): Tool => {
    return details[id] ?? new Tool(id);
  };
}

export default Tool;
