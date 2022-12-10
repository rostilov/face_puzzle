import { Point } from './Geometry';

export class SceneObject {
  // define a constructor inside class
  constructor(rect) {
    this.rect = rect.deep_copy();
    this.mass = rect.width * rect.height;
  }



  is_intersecting(object) {
    return this.#is_intersecting_not_symmetric(object) || object.#is_intersecting_not_symmetric(this)
  }

  #is_intersecting_not_symmetric(object) {
    const vertexes = object.rect.get_vertexes();
    for (let i = 0; i < vertexes.length; i++) {
      if (this.rect.is_point_inside(vertexes[i])) {
        return true;
      }
    }
    return false;
  }

  get_direction_after_collision(direction) {
    return new Point(-direction.x, -direction.y)
  }

}