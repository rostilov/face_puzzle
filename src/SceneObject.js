import { Point, distance } from './Geometry';

export class SceneObject {
  // define a constructor inside class
  constructor(rect, original_video_point) {
    this.rect = rect.deep_copy();
    this.mass = rect.width * rect.height;
    this.original_video_point = original_video_point.deep_copy();
  }


  deep_copy() {
    return new SceneObject(this.rect.deep_copy(), this.original_video_point.deep_copy());
  }

  is_intersecting(object) {
    return this.#is_intersecting_not_symmetric(object) || object.#is_intersecting_not_symmetric(this)
  }

  dist(point) {
    const d_x = (this.rect.tl.x + (this.rect.width / 2) - point.x);
    const d_y = (this.rect.tl.y + (this.rect.height / 2) - point.y);
    return Math.sqrt(d_x * d_x + d_y * d_y);
  }

  is_point_inside(point) {
    return this.rect.is_point_inside(point);
  }

  translate(vector) {
    let after_update_rect = this.rect.deep_copy();
    after_update_rect.translate(vector);
    return new SceneObject(after_update_rect, this.original_video_point);
  }

  get_closest(object) {
    const obj_sides = object.rect.get_sides();
    const sides = this.rect.get_sides();
    let min_pair = [-1, -1];
    let min_dist = 100000000000;

    for (let j = 0; j < sides.length; j++) {
      // Theres is no magic. We can find distance only top-to-bottom left-to-right
      const adj_index = ((j + 2) % 4);
      const adj_side = obj_sides[adj_index];
      const side = sides[j];
      const dist = (distance(side[0], adj_side[1]) + distance(side[1], adj_side[0])) / 2;
      if (dist < min_dist) {
        min_dist = dist;
        min_pair = [j, adj_index];
      }
    }
    return [min_pair, min_dist];
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

  draw(video, ctx) {
    const draw_part = (video, ctx, tl, part_start_point, part_width, part_height) => {
      ctx.drawImage(video, part_start_point.x, part_start_point.y, part_width, part_height, tl.x, tl.y, part_width, part_height)
    }
    draw_part(video, ctx, this.rect.tl, this.original_video_point, this.rect.width, this.rect.height);
  }
}