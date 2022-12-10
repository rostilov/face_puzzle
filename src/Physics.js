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

  #is_wall_vertical() {
    const dx = this.rhs.x - this.lhs.x;
    const dy = this.rhs.y - this.lhs.y;
    return Math.abs(dx) < Math.abs(dy);
  }

  // Check that all vertexes of rect on one side of wall
  #is_all_on_one_side(rect) {
    const vertexes = rect.get_vertexes();

    const check_side = (index, field) => {
      return vertexes[index][field] > this.lhs[field];
    }
    const check_field = (field) => {
      if (vertexes.length === 0) {
        return true;
      }


      const side = check_side(0, field);
      for (let i = 0; i < vertexes.length; i++) {
        if (side !== check_side(i, field)) {
          return false;
        }
      }
      return true;
    }

    return check_field('x') && check_field('y');
  }

  is_intersecting(rect) {
    if (!this.#is_all_on_one_side(rect)) {
      return true;
    }
    const vertexes = rect.get_vertexes();
    for (let i = 0; i < vertexes.length; i++) {
      if (this.distance(vertexes[i]) <= 1) {
        return true;
      }
    }
    return false;
  }

  get_direction_after_bounce(direction) {
    // We suppose that wall can be vertical OR horizontal. Normally you shold add orthogonal vector calculation.
    if (this.#is_wall_vertical()) {
      return new Point(-direction.x, direction.y);
    } else {
      return new Point(direction.x, -direction.y);
    }
  }

}