import { Point } from './Geometry';
import { SceneObject } from './SceneObject';
const MAX_ALLOWED_SPEED = 30.
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
    const d_x = (objects[i].rect.tl.x + (objects[i].rect.width / 2) - img_x);
    const d_y = (objects[i].rect.tl.y + (objects[i].rect.height / 2) - img_y);
    const dist = d_x * d_x + d_y * d_y;
    if (dist < min_dist) {
      min_dist = dist;
      min_ind = i;
    }
  }
  if (objects[min_ind].rect.is_point_inside(new Point(img_x, img_y))) {
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
    let after_update_rect = objects[min_ind].rect.deep_copy();
    after_update_rect.translate(speed);
    const object_after_update = new SceneObject(after_update_rect);

    let is_intersecting = false;
    for (let j = 0; j < walls.length; j++) {
      if (walls[j].is_intersecting(after_update_rect)) {
        is_intersecting = true;
        break;
      }
    }

    if (!is_intersecting) {
      for (let j = 0; j < objects.length; j++) {
        if (min_ind === j) {
          continue;
        }
        if (objects[j].is_intersecting(object_after_update)) {
          is_intersecting = true;
        }
      }
    }
    if (is_intersecting) {
      last_speeds[min_ind] = new Point(0, 0);
    } else {
      objects[min_ind].rect = after_update_rect;
      last_speeds[min_ind] = trimmed_speed;
    }
  }
  state.last_clicked_x = x;
  state.last_clicked_y = y;
}
