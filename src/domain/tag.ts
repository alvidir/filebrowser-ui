class Tag {
  tag: string;
  title?: string;
  description?: string;
  iconClass?: string;
  color?: string;
  active?: boolean;

  constructor(tag: string) {
    this.tag = tag;
  }
}

export { Tag };
