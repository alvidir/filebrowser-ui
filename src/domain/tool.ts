class Tool {
  id: string;
  name: string;
  iconUri: string = "";
  baseUri: string = "";

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export { Tool };
