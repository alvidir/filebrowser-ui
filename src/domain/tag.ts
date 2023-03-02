import { tags } from "@/domain/details";

enum Tags {
  Virtual = "virtual",
  Agora = "agora",
}

class Tag {
  name: string;
  title?: string;
  description?: string;
  icon?: string;
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
