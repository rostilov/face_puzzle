import { Point } from './Geometry';

export class MouseState {
  constructor() {
    this.last_clicked_x = 0;
    this.last_clicked_x = 0;
    this.is_moving = false;
  }
}


export function down_callback(state, canvasoffsetLeft, canvasoffsetTop, x, y, last_rects) {
  const img_x = (x - canvasoffsetLeft);
  const img_y = (y - canvasoffsetTop);
  let min_dist = 1000000000000;
  let min_ind = -1;
  for (let i = 0; i < last_rects.length; i++) {
    const d_x = (last_rects[i].tl_x + (last_rects[i].width / 2) - img_x);
    const d_y = (last_rects[i].tl_y + (last_rects[i].height / 2) - img_y);

    const dist = d_x * d_x + d_y * d_y;
    if (dist < min_dist) {
      min_dist = dist;
      min_ind = i;
    }
  }

  if ((last_rects[min_ind].tl_x <= img_x) && (last_rects[min_ind].tl_x + last_rects[min_ind].width >= img_x) && (last_rects[min_ind].tl_y <= img_y) && (last_rects[min_ind].tl_y + last_rects[min_ind].height >= img_y)) {
    state.is_moving = true;
    state.last_clicked_x = x;
    state.last_clicked_y = y;
  }
  return min_ind;
}


export function move_callback(state, x, y, last_rects, last_speeds, min_ind) {
  if (!state.is_moving) {
    return
  }
  const last_dx = x - state.last_clicked_x;
  const last_dy = y - state.last_clicked_y;
  if (min_ind !== -1) {
    last_rects[min_ind].tl_x = last_rects[min_ind].tl_x + last_dx;
    last_rects[min_ind].tl_y = last_rects[min_ind].tl_y + last_dy;
    last_speeds[min_ind] = new Point(last_dx, last_dy);
  }
  state.last_clicked_x = x;
  state.last_clicked_y = y;
}
