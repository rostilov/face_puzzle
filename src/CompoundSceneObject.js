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

  merge(object) {
    let objects = [];
    for (let i = 0; i < this.objects.length; i++) {
      objects.push(this.objects[i].deep_copy());
    }
    const [closest_indexes_info, closest_dist] = this.get_closest(object);
    const get_side = (obj, item) => {
      const sides = obj.objects[item.object_index].rect.get_sides();
      const side = sides[item.side_index];
      return side;
    };
    const target_point = get_side(this, closest_indexes_info[0])[0];
    const source_point = get_side(object, closest_indexes_info[1])[1];
    const shift = target_point.add(source_point.scale(-1.));
    object = object.translate(shift);
    for (let i = 0; i < object.objects.length; i++) {
      objects.push(object.objects[i].deep_copy());
    }
    return new CompoundSceneObject(objects);
  }

  is_intersecting(object) {
    return this.#is_intersecting_not_symmetric(object) || object.#is_intersecting_not_symmetric(this)
  }

  dist(point) {
    let min_dist = 100000000000;
    for (let i = 0; i < this.objects.length; i++) {
      const dist = this.objects[i].dist(point);
      if (dist < min_dist) {
        min_dist = dist;
      }
    }
    return min_dist;
  }

  translate(shift) {
    let objects = [];
    for (let i = 0; i < this.objects.length; i++) {
      objects.push(this.objects[i].translate(shift));
    }
    return new CompoundSceneObject(objects);
  }

  is_point_inside(point) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].is_point_inside(point)) {
        return true;
      }
    }
    return false;
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