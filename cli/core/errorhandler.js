module.exports = {
    observers: [],

  addObserver(observer) {
    this.observers.push(observer);
  },

  notify(data) {
    if (this.observers.length > 0) {
      this.observers.forEach(observer => observer(data));
    }
  }
}