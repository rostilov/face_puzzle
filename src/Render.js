import { Point, Rect } from './Geometry';
import { Wall } from './Physics';
import { canvas_arrow } from './DrawUtils';

export class ObjectsState {
  constructor() {
    this.last_choosed_rect_index = -1;
  }
}

export function initialization(width, height, vid_width, vid_height) {
  let last_rects = [];

  last_rects.push(new Rect(100, 100, vid_width / 2, vid_height));
  last_rects.push(new Rect(400, 200, vid_width / 2, vid_height / 2));
  last_rects.push(new Rect(550, 100, vid_width / 2, vid_height / 2));

  let last_speeds = [];

  last_speeds.push(new Point(0, 0));
  last_speeds.push(new Point(0, 0));
  last_speeds.push(new Point(0, 0));

  let walls = [];
  walls.push(new Wall(new Point(0, 0), new Point(width, 0)));
  walls.push(new Wall(new Point(width, 0), new Point(width, height)));
  walls.push(new Wall(new Point(width, height), new Point(0, height)));
  walls.push(new Wall(new Point(0, height), new Point(0, 0)));

  let tl_points = [];

  tl_points.push(new Point(0, 0));
  tl_points.push(new Point(vid_width / 2, 0));
  tl_points.push(new Point(vid_width / 2, vid_height / 2));

  return [last_rects, last_speeds, walls, tl_points];
}


export function draw_speed_arrow(ctx, moving, last_rects, last_speeds, min_ind) {
  if (moving && min_ind !== -1) {
    const rect = last_rects[min_ind];
    const center_x = rect.tl_x + (rect.width / 2);
    const center_y = rect.tl_y + (rect.height / 2);
    canvas_arrow(ctx, center_x, center_y, last_speeds[min_ind].x, last_speeds[min_ind].y, 10);
  }
}
