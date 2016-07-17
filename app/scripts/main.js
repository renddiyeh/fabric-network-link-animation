const settings = {
  width: 800,
  height: 600
};

class Dot extends fabric.Circle {
  constructor(options) {
    super(options);
    this.triggered = false;
    this.originX = 'center';
    this.originY = 'center';
  }

  get position() {
    return [this.left, this.top];
  }

  static distance(a, b) {
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Frame extends fabric.StaticCanvas {
  constructor(el, options) {
    super(el, options);
    this.dots = {};
    this.dotsId = [];
  }

  addDots(count = 1) {
    for (let i = count - 1; i >= 0; i--) {
      const dot = new Dot({
        radius: 20, fill: 'green', left: _.random(settings.width), top: _.random(settings.height)
      });
      this.dots[i] = dot;
      this.dotsId.push(i);

      this.add(dot);
    }
  }

  dot(id) {
    return this.dots[id];
  }

  linkDots(a, b) {
    const dotA = this.dots[a];
    const dotB = this.dots[b];
    const link = new fabric.Line([dotA.left, dotA.top, dotB.left, dotB.top], { stroke: 'black' });

    this.add(link);
  }

  linkNearestDots(id) {
    const distances = this.dotsId.filter(i => i !== id).map(i => ({
      id: i,
      distance: Dot.distance(this.dots[id], this.dots[i])
    })).sort((a, b) => a.distance - b.distance);
    _.take(distances, 2).forEach(d => {
      this.linkDots(id, d.id);
    });
  }
}

// create a wrapper around native canvas element (with id="c")
const frame = new Frame('canvas', settings);

frame.addDots(5);
frame.linkNearestDots(2);
