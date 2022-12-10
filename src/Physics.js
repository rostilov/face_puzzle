import { Point } from './Geometry';

export class Wall {
  // define a constructor inside class
  constructor(lhs_point, rhs_point) {
    this.lhs = lhs_point;
    this.rhs = rhs_point;
  }

  distance(point) {
    const dx = this.rhs.x - this.lhs.x;
    const dy = this.rhs.y - this.lhs.y;
    return Math.abs(dx * (this.lhs.y - point.y) - dy * (this.lhs.x - point.x)) / Math.sqrt(dx * dx + dy * dy);
  }

  is_intersecting(rect) {
    const vertexes = rect.get_vertexes();
    for (let i = 0; i < vertexes.length; i++) {
      if (this.distance(vertexes[i]) <= 1) {
        // console.log("INTERSECTION ", this.distance(vertexes[i]), i, vertexes[i].x, vertexes[i].y)
        return true;
      }
    }
    return false;
  }

  get_direction_after_bounce(direction) {
    const dx = this.rhs.x - this.lhs.x;
    const dy = this.rhs.y - this.lhs.y;
    // We suppose that wall can be vertical OR horizontal. Normally you shold add orthogonal vector calculation.
    let is_wall_vertical = Math.abs(dx) < Math.abs(dy);
    if (is_wall_vertical) {
      return new Point(-direction.x, direction.y);
    } else {
      return new Point(direction.x, -direction.y);
    }
  }
  // method show
  // show(){
  //   console.log(this.x, this.y);
  // }
}