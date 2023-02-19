class Warning {
  title: string;
  text: string;
  level?: string;

  constructor(title: string, text: string) {
    this.title = title;
    this.text = text;
  }
}

export { Warning };
