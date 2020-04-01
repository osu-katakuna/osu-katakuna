class Event {
  constructor() {
    this.name = "UnknownEvent"
    this.type = -1
  }

  run(args) {
    throw new Error("The event does not implement 'run'")
  }
}

exports.Event = Event;
