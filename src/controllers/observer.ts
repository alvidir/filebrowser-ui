interface IObserver {
  update(): void;
}

interface ISubject {
  addObserver: (observer: IObserver) => void;
  removeObserver: (observer: IObserver) => void;
}

class Subject implements ISubject {
  private observers: Array<IObserver> = [];

  protected broadcast = () => {
    this.observers.forEach((observer) => observer.update());
  };

  addObserver = (observer: IObserver) => {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  };

  removeObserver = (observer: IObserver) => {
    const index = this.observers.indexOf(observer);
    if (index > -1) this.observers.splice(index, 1);
  };
}

export default Subject;
export { IObserver, ISubject };
