import EventEmitter from 'events';

export class Queue {
  emitter = new EventEmitter();
  value = 0;

  constructor() {
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.emitter.emit('package', this.value);
        this.value++;
      }
    }, 100);
  }
}
