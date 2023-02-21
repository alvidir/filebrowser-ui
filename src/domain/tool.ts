import Config from "@/config.json";

enum Tools {
  Agora = "agora",
}

const tools: { [key: string]: Tool } = {
  [Tools.Agora]: {
    id: Tools.Agora,
    name: "Agora",
    iconUri: Config.AGORA_LOGO_URI,
    baseUri: Config.AGORA_BASE_URI,
  },
};

class Tool {
  id: string;
  name: string;
  iconUri = "";
  baseUri = "";

  constructor(id: string) {
    this.id = id;
    this.name = id;
  }

  static find = (id: string): Tool => {
    return tools[id] ?? new Tool(id);
  };
}

export default Tool;
