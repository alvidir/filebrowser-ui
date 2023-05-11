enum Tag {
  Virtual = "virtual",
  Agora = "agora",
}
interface TagInfo {
  name: string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}

const tags: { [key: string]: TagInfo } = {
  [Tag.Virtual]: {
    name: "virtual",
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    icon: "bx bxs-cat",
  },
  [Tag.Agora]: {
    name: "agora",
    color: "#BF7389",
    title: "Bring your characters to life.",
    description:
      "Keep your characters in a single place, establish its traits, its relations, and perfect the evolution of them all.",
    icon: "icon-greek-pillar-outline",
  },
};

const findTag = (tag: string): TagInfo => {
  return tags[tag] ?? { name: tag };
};

const withVirtualTag = (tags: Array<string>): Array<string> => {
  if (!tags.includes(Tag.Virtual)) tags.push(Tag.Virtual);
  return tags;
};

export { Tag, TagInfo, findTag, withVirtualTag };
