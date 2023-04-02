import config from "@/config.json";

const apps: { [key: string]: Details } = {
  agora: {
    name: "agora",
    color: "#BF7389",
    title: "Bring your characters to life.",
    description:
      "Keep your characters in a single place, establish its traits, its relations, and perfect the evolution of them all.",
    icon: "icon-greek-pillar-outline",
    uri: config.AGORA_BASE_URI,
  },
};

const tags: { [key: string]: Details } = Object.assign({}, apps, {
  virtual: {
    name: "virtual",
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    icon: "bx bxs-cat",
  },
});

interface Details {
  name: string;
  color?: string;
  title?: string;
  description?: string;
  icon: string;
  uri?: string;
}

export { apps, tags, Details };
