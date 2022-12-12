import { Point } from './Geometry';

export class CompoundSceneObject {
  constructor(objects) {
    this.objects = [];
    for (let i = 0; i < objects.length; i++) {
      this.objects.push(objects[i].deep_copy());
    }
  }


  deep_copy() {
    return new CompoundSceneObject(this.objects);
  }

  is_intersecting(object) {
    return this.#is_intersecting_not_symmetric(object) || object.#is_intersecting_not_symmetric(this)
  }

  get_closest(object) {
    let min_pair = [];
    let min_dist = 100000000000;

    for (let i = 0; i < this.objects.length; i++) {
      const lhs = this.objects[i];
      for (let j = 0; j < object.objects.length; j++) {
        const rhs = object.objects[j];
        const [closest_indexes, closest_dist] = lhs.get_closest(rhs);
        if (closest_dist < min_dist) {
          min_dist = closest_dist;
          min_pair = [{ 'object_index': i, 'side_index': closest_indexes[0] }, { 'object_index': j, 'side_index': closest_indexes[1] }];
        }
        if (lhs.get_closest(rhs)) {

        }
        if (lhs.is_intersecting(rhs)) {
          return true;
        }
      }
    }

    return [min_pair, min_dist];
  }

  #is_intersecting_not_symmetric(object) {
    for (let i = 0; i < this.objects.length; i++) {
      const lhs = this.objects[i];
      for (let j = 0; j < object.objects.length; j++) {
        const rhs = object.objects[j];
        if (lhs.is_intersecting(rhs)) {
          return true;
        }
      }
    }
    return false;
  }

  get_direction_after_collision(direction) {
    return new Point(-direction.x, -direction.y)
  }

  draw(video, ctx) {
    for (let j = 0; j < this.objects.length; j++) {
      this.objects[j].draw(video, ctx);
    }
  }
}