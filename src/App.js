import './App.css';
import React, { useRef, useEffect } from 'react'
import { initialization } from './Render';
import { draw_circle_party, draw_sector_line } from './DrawUtils';
import { down_callback, move_callback, MouseState } from './MouseCallbacks';
import { SceneObject } from './SceneObject';
import { check_walls_intersection_indexes, check_objects_intersection_indexes } from './Render';
const WebcamOnCanvas = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);



  useEffect(() => {
    let video = videoRef.current;
    video.style.display = "none";
    getVideo();
    // paintToCanvas();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 200 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  };


  let objects = [];
  let last_speeds = [];
  let walls = [];
  let min_ind = -1;

  let is_initialized = false;
  let mouse_state = new MouseState();


  const paintToCanvas = () => {
    let video = videoRef.current;

    let canvas = canvasRef.current;
    canvas.style.backgroundColor = 'rgb(138,43,226)'
    let ctx = canvas.getContext("2d");

    const width = 900;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    const vid_height = video.videoHeight;
    const vid_width = video.videoWidth;


    let frameCount = 0
    setInterval(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      frameCount++
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // Some funny effect
      draw_circle_party(ctx, frameCount)
      const draw_part = (video, ctx, to_x, to_y, part_start_x, part_start_y, part_width, part_height) => {
        ctx.drawImage(video, part_start_x, part_start_y, part_width, part_height, to_x, to_y, part_width, part_height)
      }

      if (!is_initialized) {
        [objects, last_speeds, walls] = initialization(width, height, vid_width, vid_height);
        is_initialized = true;
      }

      if (mouse_state.last_clicked_x === 0) {
        mouse_state.last_clicked_x = ctx.canvas.offsetLeft;
      }
      if (mouse_state.last_clicked_y === 0) {
        mouse_state.last_clicked_y = ctx.canvas.offsetTop;
      }


      // Check bounces
      for (let i = 0; i < last_speeds.length; i++) {
        if (mouse_state.is_moving && (i === min_ind)) {
          continue;
        }
        const speed = last_speeds[i];

        let after_update_rect = objects[i].rect.deep_copy();
        after_update_rect.translate(speed);
        const object_after_update = new SceneObject(after_update_rect, objects[i].original_video_point);
        let bounced = false;
        const walls_indexes = check_walls_intersection_indexes(object_after_update, walls);
        if (walls_indexes.length > 0) {
          // TODO. Not properly working if several walls are intersected
          last_speeds[i] = walls[walls_indexes[0]].get_direction_after_collision(speed);
          bounced = true;
        }
        if (!bounced) {
          const objects_indexes = check_objects_intersection_indexes(object_after_update, i, objects);
          if (objects_indexes.length > 0) {
            // TODO. Not properly working if several objects are intersected
            last_speeds[i] = objects[objects_indexes[0]].get_direction_after_collision(speed);
          }
        }
      }

      const DUMP_FACTOR = 1.003
      for (let i = 0; i < objects.length; i++) {
        if (min_ind !== i || !mouse_state.is_moving) {
          objects[i].rect.tl.x = objects[i].rect.tl.x + last_speeds[i].x;
          objects[i].rect.tl.y = objects[i].rect.tl.y + last_speeds[i].y;
        }
        last_speeds[i] = last_speeds[i].scale(1 / DUMP_FACTOR);
      }

      // We need indexes order to guarantee that current "draged" part is on top of others
      let indexes_order = [];
      for (let i = 0; i < objects.length; i++) {
        if (i !== min_ind) {
          indexes_order.push(i);
        }
      }
      if (min_ind !== -1) {
        indexes_order.push(min_ind);
      }
      for (let i = 0; i < objects.length; i++) {
        objects[indexes_order[i]].draw(video, ctx);
      }

      //Draw closest side




      if (min_ind !== -1) {
        class ObjectSide {
          constructor(x, y) {
            this.object_index = x;
            this.object_side_index = y;
          }
          // last_rects.push(new Rect(30, 30, vid_width / 2, vid_height / 2));
          // last_rects.push(new Rect(400, 30, vid_width / 2, vid_height / 2));
          // last_rects.push(new Rect(30, 400, vid_width / 2, vid_height / 2));
          // last_rects.push(new Rect(400, 400, vid_width / 2, vid_height / 2));

          #check_truth_pair(item) {
            if (this.object_index === 0) {
              if (this.object_side_index === 1 && item.object_index === 1 && item.object_side_index === 3) {
                return true;
              }
              if (this.object_side_index === 2 && item.object_index === 2 && item.object_side_index === 0) {
                return true;
              }
            }
            if (this.object_index === 3) {
              if (this.object_side_index === 0 && item.object_index === 1 && item.object_side_index === 2) {
                return true;
              }
              if (this.object_side_index === 3 && item.object_index === 2 && item.object_side_index === 1) {
                return true;
              }
            }
            return false;
          }
          check_truth_pair(item) {
            return item.#check_truth_pair(this) || this.#check_truth_pair(item);
          }

        }
        const sides = objects[min_ind].rect.get_sides();
        const coef = 0.0002;
        const target = objects[min_ind].rect.get_center();
        const draw_line = (from, to, col) => {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.lineWidth = 5;
          ctx.strokeStyle = col;
          ctx.stroke();
        };
        let min_inds = [-1, -1, -1, -1];
        let min_dists = [0, 0, 0, 0];
        for (let i = 0; i < objects.length; i++) {
          if (i === min_ind) {
            continue;
          }



          const [closest_indexes, closest_dist] = objects[min_ind].get_closest(objects[i]);
          const side_index = closest_indexes[0];
          if (min_inds[side_index] === -1) {
            min_inds[side_index] = new ObjectSide(i, closest_indexes[1]);
            min_dists[side_index] = closest_dist;
          } else {
            if (min_dists[side_index] > closest_dist) {
              min_inds[side_index] = new ObjectSide(i, closest_indexes[1]);
              min_dists[side_index] = closest_dist;
            }
          }


        }

        for (let i = 0; i < min_inds.length; i++) {
          const pair = new ObjectSide(min_ind, i);
          const item = min_inds[i];
          if (item !== -1) {
            const is_truth_pair = pair.check_truth_pair(item)
            let col = 'rgb(255, 0, 0)';
            if (is_truth_pair) {
              col = 'rgb(0, 255, 0)';
            }
            draw_line(sides[i][0], sides[i][1], col);
            const sides2 = objects[item.object_index].rect.get_sides();
            draw_line(sides2[item.object_side_index][0], sides2[item.object_side_index][1], col);

            const source = objects[item.object_index].rect.get_center();
            if (is_truth_pair) {
              last_speeds[item.object_index].x = last_speeds[item.object_index].x + coef * (target.x - source.x);
              last_speeds[item.object_index].y = last_speeds[item.object_index].y + coef * (target.y - source.y);
            } else {
              last_speeds[item.object_index].x = last_speeds[item.object_index].x - coef * (target.x - source.x);
              last_speeds[item.object_index].y = last_speeds[item.object_index].y - coef * (target.y - source.y);
            }
          }
        }

        // draw_line(sides[min_pair[0]][0], sides[min_pair[0]][1]);
        // const sides2 = objects[min_index].rect.get_sides();
        // draw_line(sides2[min_pair[1]][0], sides2[min_pair[1]][1]);
        // ctx.beginPath();
        // const start = sides[min_pair[0]][0];
        // const end = sides[min_pair[0]][1];
        // ctx.moveTo(start.x, start.y);
        // ctx.lineTo(end.x, end.y);
        // const sides2 = objects[min_index].rect.get_sides();
        // const start2 = sides2[min_pair[1]][0];
        // const end2 = sides2[min_pair[1]][1];
        // ctx.moveTo(start2.x, start2.y);
        // ctx.lineTo(end2.x, end2.y);
        // ctx.lineWidth = 10;
        // ctx.strokeStyle = 'rgb(0, 255, 0)';
        // ctx.stroke();


      }


      // Draw direction of current draged part
      // draw_speed_arrow(ctx, mouse_state.is_moving, last_rects, last_speeds, min_ind);

      // Draw moving purple line
      draw_sector_line(ctx, 2 * frameCount % width);
    });
    return
  };

  const move = ({ nativeEvent }) => {
    const { x, y } = nativeEvent;
    move_callback(mouse_state, x, y, objects, last_speeds, walls, min_ind);
  };

  const down = ({ nativeEvent }) => {
    const { x, y } = nativeEvent;
    min_ind = down_callback(mouse_state, canvasRef.current.offsetLeft, canvasRef.current.offsetTop, x, y, objects);
  };
  const up = ({ nativeEvent }) => {
    mouse_state.is_moving = false;
    min_ind = -1;
  };

  return (
    <div>
      <div>
        <video
          onCanPlay={() => paintToCanvas()}
          ref={videoRef}
          className="player"
        />
        <canvas
          ref={canvasRef}
          onMouseMove={move}
          onMouseDown={down}
          onMouseUp={up}
          className="photo" />
      </div>
    </div>
  );
};


function App() {
  return (
    <div className="App">
      <WebcamOnCanvas />
    </div>
  );
}

export default App;
