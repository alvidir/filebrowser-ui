interface Observer {
  update(): void;
}

interface Subject {
  addObserver: (observer: Observer) => void;
  removeObserver: (observer: Observer) => void;
}

class SubjectImpl implements Subject {
  private observers: Array<Observer> = [];

  protected broadcast = () => {
    this.observers.forEach((observer) => observer.update());
  };

  addObserver = (observer: Observer) => {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  };

  removeObserver = (observer: Observer) => {
    const index = this.observers.indexOf(observer);
    if (index > -1) this.observers.splice(index, 1);
  };
}

export default SubjectImpl;
export { Observer, Subject };
