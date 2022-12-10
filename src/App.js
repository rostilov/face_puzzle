import './App.css';
import React, { useRef, useEffect } from 'react'
import { initialization } from './Render';
import { canvas_arrow, draw_circle_party, draw_sector_line } from './DrawUtils';
import { Point } from './Geometry';




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


  let last_rects = [];
  let last_speeds = [];
  let tl_points = [];
  let walls = [];
  let min_ind = -1;
  let moving = false;
  let last_mouse_down_x = 0;
  let last_mouse_down_y = 0;

  let last_dx = 0;
  let last_dy = 0;
  let is_initialized = false;


  const paintToCanvas = () => {
    let video = videoRef.current;

    let canvas = canvasRef.current;
    canvas.style.backgroundColor = 'rgb(138,43,226)'
    let ctx = canvas.getContext("2d");

    const width = 800;
    const height = 450;
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
        [last_rects, last_speeds, walls, tl_points] = initialization(width, height, vid_width, vid_height);
        is_initialized = true;
      }

      if (last_mouse_down_x === 0) {
        last_mouse_down_x = ctx.canvas.offsetLeft;
      }
      if (last_mouse_down_y === 0) {
        last_mouse_down_y = ctx.canvas.offsetTop;
      }


      // Check bounces
      for (let i = 0; i < last_speeds.length; i++) {
        if (moving && i === min_ind) {
          continue;
        }
        const speed = last_speeds[i];
        for (let j = 0; j < walls.length; j++) {
          if (walls[j].is_intersecting(last_rects[i])) {
            // console.log("INTERSECTION WALL IND ", j, " RECT INDEX ", i)
            last_speeds[i] = walls[j].get_direction_after_bounce(speed);
          }
        }
      }


      for (let i = 0; i < last_rects.length; i++) {
        if (min_ind !== i || !moving) {
          last_rects[i].tl_x = last_rects[i].tl_x + last_speeds[i].x;
          last_rects[i].tl_y = last_rects[i].tl_y + last_speeds[i].y;
        }
      }

      // We need indexes order to guarantee that current "draged" part is on top of others
      let indexes_order = [];
      for (let i = 0; i < last_rects.length; i++) {
        if (i !== min_ind) {
          indexes_order.push(i);
        }
      }
      if (min_ind !== -1) {
        indexes_order.push(min_ind);
      }
      for (let i = 0; i < last_rects.length; i++) {
        const ind = indexes_order[i]
        const rect = last_rects[ind];
        const tl = tl_points[ind];
        draw_part(video, ctx, rect.tl_x, rect.tl_y, tl.x, tl.y, rect.width, rect.height);
      }

      // Draw direction of current draged part
      if (moving) {
        const rect = last_rects[min_ind];
        const center_x = rect.tl_x + (rect.width / 2);
        const center_y = rect.tl_y + (rect.height / 2);
        canvas_arrow(ctx, center_x, center_y, last_speeds[min_ind].x, last_speeds[min_ind].y, 10);
      }

      // Draw moving purple line
      draw_sector_line(ctx, 2 * frameCount % width);
    });
    return
  };

  const move = ({ nativeEvent }) => {
    if (!moving) {
      return
    }
    const { x, y } = nativeEvent;
    last_dx = x - last_mouse_down_x;
    last_dy = y - last_mouse_down_y;
    if (min_ind !== -1) {
      last_rects[min_ind].tl_x = last_rects[min_ind].tl_x + last_dx;
      last_rects[min_ind].tl_y = last_rects[min_ind].tl_y + last_dy;
      last_speeds[min_ind] = new Point(last_dx, last_dy);
    }
    last_mouse_down_x = x;
    last_mouse_down_y = y;
  };

  const down = ({ nativeEvent }) => {
    const { x, y } = nativeEvent;
    let canvas = canvasRef.current;
    const img_x = (x - canvas.offsetLeft);
    const img_y = (y - canvas.offsetTop);
    let min_dist = 1000000000000;
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
      moving = true;
      last_mouse_down_x = x;
      last_mouse_down_y = y;
    }

  };
  const up = ({ nativeEvent }) => {
    moving = false;
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
