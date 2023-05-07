import * as config from "@/config.json";

interface Tool {
  name: string;
  icon: string;
  uri: string;
}

const tools = Array<Tool>({
  name: "agora",
  icon: "icon-greek-pillar-outline",
  uri: config.AGORA_BASE_URI,
});

const getTool = (id: string): Tool | undefined => {
  const selected = tools.filter((tool) => tool.name === id);
  if (selected.length) return selected[0];
};

export { Tool, tools, getTool };
