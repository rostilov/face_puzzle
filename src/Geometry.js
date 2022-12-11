
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  scale(scale) {
    return new Point(this.x * scale, this.y * scale);
  }
  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
export function distance(lhs, rhs) {
  const dx = (lhs.x - rhs.x);
  const dy = (lhs.y - rhs.y);
  return Math.sqrt(dx * dx + dy * dy);
}


export class Rect {
  // define a constructor inside class
  constructor(tl_x, tl_y, width, height) {
    this.tl = new Point(tl_x, tl_y);
    this.width = width;
    this.height = height;
  }

  print(prefix) {
    console.log(prefix, this.tl.x, this.tl.y, this.width, this.height);
  }

  deep_copy() {
    return new Rect(this.tl.x, this.tl.y, this.width, this.height);
  }

  translate(shift_vector) {
    this.tl.x = this.tl.x + shift_vector.x;
    this.tl.y = this.tl.y + shift_vector.y;
  }
  is_point_inside(point) {
    return (this.tl.x <= point.x) && (this.tl.x + this.width >= point.x) && (this.tl.y <= point.y) && (this.tl.y + this.height >= point.y);
  }
  get_vertexes() {
    return [new Point(this.tl.x, this.tl.y), new Point(this.tl.x + this.width, this.tl.y), new Point(this.tl.x + this.width, this.tl.y + this.height), new Point(this.tl.x, this.tl.y + this.height)];
  }

  get_sides() {
    const vertexes = this.get_vertexes();
    return [[vertexes[0], vertexes[1]], [vertexes[1], vertexes[2]], [vertexes[2], vertexes[3]], [vertexes[3], vertexes[0]]];
  }
}

