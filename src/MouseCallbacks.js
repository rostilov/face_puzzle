import { Point } from './Geometry';
import { check_walls_intersection_indexes, check_objects_intersection_indexes } from './Render';

const MAX_ALLOWED_SPEED = 20.
export class MouseState {
  constructor() {
    this.last_clicked_x = 0;
    this.last_clicked_x = 0;
    this.is_moving = false;
  }
}


export function down_callback(state, canvasoffsetLeft, canvasoffsetTop, x, y, objects) {
  const img_x = (x - canvasoffsetLeft);
  const img_y = (y - canvasoffsetTop);
  let min_dist = 1000000000000;
  let min_ind = -1;
  for (let i = 0; i < objects.length; i++) {
    const dist = objects[i].dist(new Point(img_x, img_y));
    if (dist < min_dist) {
      min_dist = dist;
      min_ind = i;
    }
  }
  if (objects[min_ind].is_point_inside(new Point(img_x, img_y))) {
    state.is_moving = true;
    state.last_clicked_x = x;
    state.last_clicked_y = y;
  }
  return min_ind;
}


export function move_callback(state, x, y, objects, last_speeds, walls, min_ind) {
  if (!state.is_moving) {
    return
  }
  const last_dx = x - state.last_clicked_x;
  const last_dy = y - state.last_clicked_y;

  const speed = new Point(last_dx, last_dy);
  const norm = speed.norm();
  let scale = 1.;
  if (norm > MAX_ALLOWED_SPEED) {
    scale = norm / MAX_ALLOWED_SPEED;
  }

  const trimmed_speed = speed.scale(1 / scale);

  if (min_ind !== -1) {

    const object_after_update = objects[min_ind].translate(speed);

    let is_intersecting = false;
    if (check_walls_intersection_indexes(object_after_update, walls).length > 0) {
      is_intersecting = true;
    }

    if (!is_intersecting) {
      let neighbours_to_change = []
      for (let j = 0; j < objects.length; j++) {
        if (min_ind === j) {
          continue;
        }
        if (objects[j].is_intersecting(object_after_update)) {
          let object_after_shift = objects[j].translate(speed);

          const walls_indexes = check_walls_intersection_indexes(object_after_shift, walls);
          if (walls_indexes.length > 0) {
            is_intersecting = true;
            break;
          }
          const objects_indexes = check_objects_intersection_indexes(object_after_shift, j, objects);
          if (objects_indexes.length > 0) {
            is_intersecting = true;
            break;
          }
          neighbours_to_change.push({ 'index': j, 'new_object': object_after_shift });
        }
      }

      if (!is_intersecting) {
        for (let j = 0; j < neighbours_to_change.length; j++) {
          const item = neighbours_to_change[j]
          objects[item.index] = item.new_object;
          last_speeds[item.index] = trimmed_speed;
        }
      }
    }
    if (is_intersecting) {
      last_speeds[min_ind] = new Point(0, 0);
    } else {
      objects[min_ind] = object_after_update;
      last_speeds[min_ind] = trimmed_speed;
    }
  }
  state.last_clicked_x = x;
  state.last_clicked_y = y;
}
