export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// const distance = (lhs, rhs) => {
//   const dx = (lhs.x - rhs.x);
//   const dy = (lhs.y - rhs.y);
//   return Math.sqrt(dx * dx + dy * dy);
// }

export class Rect {
  // define a constructor inside class
  constructor(tl_x, tl_y, width, height) {
    this.tl = new Point(tl_x, tl_y);
    this.width = width;
    this.height = height;
  }

  get_vertexes() {
    return [new Point(this.tl.x, this.tl.y), new Point(this.tl.x + this.width, this.tl.y), new Point(this.tl.x + this.width, this.tl.y + this.height), new Point(this.tl.x, this.tl.y + this.height)];
  }
}

