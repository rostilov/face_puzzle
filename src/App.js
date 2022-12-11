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
      .getUserMedia({ video: { width: 400 } })
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
  let tl_points = [];
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
        [objects, last_speeds, walls, tl_points] = initialization(width, height, vid_width, vid_height);
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
        const object_after_update = new SceneObject(after_update_rect);
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
        const ind = indexes_order[i]
        const rect = objects[ind].rect;
        const tl = tl_points[ind];
        draw_part(video, ctx, rect.tl.x, rect.tl.y, tl.x, tl.y, rect.width, rect.height);
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
