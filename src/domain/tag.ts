enum Tags {
  Virtual = "virtual",
  Agora = "agora",
}

const tags: { [key: string]: Tag } = {
  [Tags.Virtual]: {
    name: Tags.Virtual,
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    iconClass: "bx bxs-cat",
  },
  [Tags.Agora]: {
    name: Tags.Agora,
    color: "#BF7389",
    title: "Bring your characters to life.",
    description:
      "Keep your characters in a single place, establish its traits, its relations, and perfect the evolution of them all.",
    iconSrc:
      "https://raw.githubusercontent.com/alvidir/statics/main/pictures/svg/greek_pillar.svg",
  },
};

class Tag {
  name: string;
  title?: string;
  description?: string;
  iconClass?: string;
  iconSrc?: string;
  color?: string;

  constructor(tag: string) {
    this.name = tag;
  }

  static find = (tag: string): Tag => {
    return tags[tag] ?? new Tag(tag);
  };
}

export default Tag;
export { Tags };
