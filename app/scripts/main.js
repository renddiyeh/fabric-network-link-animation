const settings = {
  width: 800,
  height: 600,
  maxDistance: 300,
  maxLink: 4,
};

class Dot extends fabric.Circle {
  constructor(options) {
    super(options);
    this.links = 0;
    this.setRadius(5);
    this.setColor('green');
    this.originX = 'center';
    this.originY = 'center';
  }

  static distance(a, b) {
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static linkOrigin(a, b) {
    const dx = a.left - b.left;
    const dy = a.top - b.top;

    return {
      x: dx > 0 ? 'right' : 'left',
      y: dy < 0 ? 'top' : 'bottom'
    };
  }
}

class Frame extends fabric.StaticCanvas {
  constructor(el, options) {
    super(el, options);
    this.dots = {};
    this.dotsId = [];
    this.velocity = 20;
  }

  addDot(left, top) {
    const dot = new Dot({
      left,
      top
    });
    const id = this.dotsId.length;
    this.dotsId.push(id);
    this.dots[id] = dot;

    this.add(dot);
  }

  addDots(count = 1) {
    for (let i = count - 1; i >= 0; i--) {
      const dot = new Dot({
        left: _.random(settings.width), top: _.random(settings.height)
      });
      dot.id = i;
      this.dots[i] = dot;
      this.dotsId.push(i);

      this.add(dot);
    }
  }

  linkDots(dotA, dotB) {
    dotB.links += 1;
    const distance = Dot.distance(dotA, dotB);
    const linkOrigin = Dot.linkOrigin(dotA, dotB);
    const link = new fabric.Line([dotA.left, dotA.top, dotB.left, dotB.top], {
      stroke: 'black',
      strokeWidth: 1,
      scaleX: 0,
      scaleY: 0,
      originX: linkOrigin.x,
      originY: linkOrigin.y,
    });

    const animation = {
      onChange: this.renderAll.bind(this),
      duration: distance / this.velocity * 100,
      easing: fabric.util.ease.quadOut,
      onComplete: () => {
        this.linkNearestDots(dotB);
      }
    };

    link.animate({
      scaleX: 1,
      scaleY: 1,
    }, animation);

    this.add(link);
  }

  linkNearestDots(dot) {
    if (dot.links < settings.maxLink) {
      dot.links += 1;
      const distances = this.dotsId.filter(i => i !== dot.id && this.dots[i].links < settings.maxLink)
        .map(i => ({
          id: i,
          distance: Dot.distance(dot, this.dots[i])
        }))
        .filter(i => i.distance < settings.maxDistance)
        .sort((a, b) => a.distance - b.distance);

      _.take(distances, settings.maxLink).forEach(d => {
        this.linkDots(dot, this.dots[d.id]);
      });
    }

  }
}

// create a wrapper around native canvas element (with id="c")
const frame = new Frame('canvas', settings);

const cirleSetting = {
  center: {
    x: settings.width / 2,
    y: settings.height / 2,
  },
  radius: 200,
  count: 24
};

for (let i = cirleSetting.count - 1; i >= 0; i--) {
  const x = cirleSetting.center.x + cirleSetting.radius * Math.cos(2 * Math.PI * i / cirleSetting.count);
  const y = cirleSetting.center.y + cirleSetting.radius * Math.sin(2 * Math.PI * i / cirleSetting.count);
  frame.addDot(x, y);
}

frame.linkNearestDots(frame.dots[0]);
