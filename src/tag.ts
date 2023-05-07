interface Tag {
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const tags: Array<Tag> = [
  {
    name: "virtual",
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    icon: "bx bxs-cat",
  },
  {
    name: "agora",
    color: "#BF7389",
    title: "Bring your characters to life.",
    description:
      "Keep your characters in a single place, establish its traits, its relations, and perfect the evolution of them all.",
    icon: "icon-greek-pillar-outline",
  },
];

const getTag = (tag: string): Tag | undefined => {
  const selected = tags.filter((tool) => tool.name === tag);
  if (selected.length) return selected[0];
};

export { Tag, tags, getTag };
