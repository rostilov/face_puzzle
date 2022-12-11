import { Point, Rect } from './Geometry';
import { Wall } from './Physics';
import { canvas_arrow } from './DrawUtils';
import { SceneObject } from './SceneObject';

export class ObjectsState {
  constructor() {
    this.last_choosed_rect_index = -1;
  }
}

export function initialization(width, height, vid_width, vid_height) {
  let last_rects = [];

  last_rects.push(new Rect(30, 30, vid_width / 2, vid_height / 2));
  last_rects.push(new Rect(400, 30, vid_width / 2, vid_height / 2));
  last_rects.push(new Rect(30, 400, vid_width / 2, vid_height / 2));
  last_rects.push(new Rect(400, 400, vid_width / 2, vid_height / 2));

  let objects = [];
  for (let i = 0; i < last_rects.length; i++) {
    objects.push(new SceneObject(last_rects[i]))
  }

  let last_speeds = [];

  last_speeds.push(new Point(0, 0));
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
  tl_points.push(new Point(0, vid_height / 2));
  tl_points.push(new Point(vid_width / 2, vid_height / 2));

  return [objects, last_speeds, walls, tl_points];
}

export function check_walls_intersection_indexes(object, walls) {
  let result = []
  for (let j = 0; j < walls.length; j++) {
    if (walls[j].is_intersecting(object.rect)) {
      result.push(j);
    }
  }
  return result;
}

export function check_objects_intersection_indexes(object, object_index, objects) {
  let result = []
  for (let j = 0; j < objects.length; j++) {
    if (object_index === j) {
      continue;
    }
    if (objects[j].is_intersecting(object)) {
      result.push(j);
    }
  }
  return result;
}

export function draw_speed_arrow(ctx, moving, last_rects, last_speeds, min_ind) {
  if (moving && min_ind !== -1) {
    const rect = last_rects[min_ind];
    const center_x = rect.tl.x + (rect.width / 2);
    const center_y = rect.tl.y + (rect.height / 2);
    canvas_arrow(ctx, center_x, center_y, last_speeds[min_ind].x, last_speeds[min_ind].y, 10);
  }
}
