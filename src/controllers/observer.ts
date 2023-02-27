interface Observer {
  update(): void;
}

class Subject {
  private observers: Array<Observer> = [];

  protected broadcast = () => {
    this.observers.forEach((observer) => observer.update());
  };

  addObserver = (observer: Observer) => {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  };
}

export { Observer, Subject };
