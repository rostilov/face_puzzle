import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from 'react'

const WebcamOnCanvas = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  const draw_circle_party = (ctx, frameCount) => {
    ctx.fillStyle = "rgb(238,130,238)"
    ctx.beginPath()
    const draw_circle = (ctx, frameCount, x, y, theta = 0.02) => {
      const radius = 5 * Math.sin(frameCount * theta) ** 2
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, 2 * Math.PI)

    }
    const pixel_step = 20
    for (const x of Array(ctx.canvas.width).keys()) {
      for (const y of Array(ctx.canvas.height).keys()) {
        if ((x % pixel_step == 0) && (y % pixel_step == 0)) {
          draw_circle(ctx, frameCount, x, y, (x + y) / 500)
        }
      }
    }

    ctx.fill()
  }
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
  const get_tl = (center_x, center_y, width, height) => {
    return [center_x - width / 2, center_y - height / 2];
  }
  class Rect {
    // define a constructor inside class
    constructor(tl_x, tl_y, width, height) {
      this.tl_x = tl_x;
      this.tl_y = tl_y;
      this.width = width;
      this.height = height;
    }
    // method show
    // show(){
    //   console.log(this.x, this.y);
    // }
  }
  class Point {
    // define a constructor inside class
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    // method show
    // show(){
    //   console.log(this.x, this.y);
    // }
  }
  let last_rects = [];
  let last_speeds = [];
  let tl_points = [];
  let min_ind = -1;
  let moving = false;
  let last_mouse_down_x = 0;
  let last_mouse_down_y = 0;

  let last_dx = 0;
  let last_dy = 0;
  const paintToCanvas = () => {
    let video = videoRef.current;

    let canvas = canvasRef.current;
    canvas.style.backgroundColor = 'rgb(138,43,226)'
    let ctx = canvas.getContext("2d");

    // const width = 320;
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const vid_height = video.videoHeight;
    const vid_width = video.videoWidth;


    let frameCount = 0
    setInterval(() => {
      // return
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      // let color = colorRef.current;
      frameCount++

      // ctx.drawImage(video, 0, 0, width, height);
      draw_circle_party(ctx, frameCount)
      const draw_part = (video, ctx, to_x, to_y, part_start_x, part_start_y, part_width, part_height) => {
        ctx.drawImage(video, part_start_x, part_start_y, part_width, part_height, to_x, to_y, part_width, part_height)
      }


      if (last_rects.length === 0) {
        last_rects.push(new Rect(100, 100, vid_width / 2, vid_height));
        last_rects.push(new Rect(400, 200, vid_width / 2, vid_height / 2));
        last_rects.push(new Rect(600, 100, vid_width / 2, vid_height / 2));
      }
      if (last_speeds.length === 0) {
        last_speeds.push(new Point(0, 0));
        last_speeds.push(new Point(0, 0));
        last_speeds.push(new Point(0, 0));
      }

      if (tl_points.length === 0) {
        tl_points.push(new Point(0, 0));
        tl_points.push(new Point(vid_width / 2, 0));
        tl_points.push(new Point(vid_width / 2, vid_height / 2));
      }

      if (last_mouse_down_x === 0) {
        last_mouse_down_x = canvas.offsetLeft;
      }
      if (last_mouse_down_y === 0) {
        last_mouse_down_y = canvas.offsetTop;
      }


      // if (min_ind !== -1) {
      //   const [tl_x, tl_y] = get_tl(last_mouse_down_x - canvas.offsetLeft, last_mouse_down_y - canvas.offsetTop, last_rects[min_ind].width, last_rects[min_ind].height);
      //   last_rects[min_ind].tl_x = tl_x;
      //   last_rects[min_ind].tl_y = tl_y;
      // }
      for (let i = 0; i < last_rects.length; i++) {
        if (min_ind !== i || !moving) {
          last_rects[i].tl_x = last_rects[i].tl_x + last_speeds[i].x;
          last_rects[i].tl_y = last_rects[i].tl_y + last_speeds[i].y;
        }
      }

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







      function canvas_arrow(context, fromx, fromy, dx, dy, length) {
        context.beginPath();
        const headlen = 10; // length of head in pixels
        const tox = fromx + dx * length;
        const toy = fromy + dy * length;
        const angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        context.stroke();
      }
      if (moving) {
        const rect = last_rects[min_ind];
        const center_x = rect.tl_x + (rect.width / 2);
        const center_y = rect.tl_y + (rect.height / 2);
        canvas_arrow(ctx, center_x, center_y, last_dx, last_dy, 10);
      }
      // ctx.drawImage(video, 0, 0, vid_width / 2, vid_height, (frameCount % width), (height - vid_height) / 2, vid_width / 2, vid_height)
      // ctx.drawImage(video, vid_width / 2, 0, vid_width / 2, vid_height, (frameCount % width) + vid_width / 2 + 10, (height - vid_height) / 2, vid_width / 2, vid_height)
      // ctx.drawImage(video, (frameCount % width), (height - vid_height) / 2);
      // ctx.drawImage(video, (frameCount % width), (height - vid_height) / 2);
      const shift = (2 * frameCount % width);
      const imageData = ctx.getImageData(shift, 0, canvas.width / 5, canvas.height);
      let data = imageData.data;

      const mix = (lhs, rhs) => {
        const alpha = 0.8;
        return alpha * lhs + (1 - alpha) * rhs;
        // return rhs;
      }
      for (let i = 0; i < data.length; i += 4) {
        data[i] = mix(data[i], 221);
        data[i + 1] = mix(data[i + 1], 160);
        data[i + 2] = mix(data[i + 2], 221);
        data[i + 3] = mix(data[i + 2], 255);
      }
      // console.log(data.length);
      data = data.slice(0, data.length - 100000);
      // imageData.data = arr;
      ctx.putImageData(imageData, shift, 0);


      // ctx.fillStyle = "rgb(238,0,238)"
      // let rad = 30;
      // ctx.moveTo(last_mouse_down_x + rad, last_mouse_down_y);
      // ctx.arc(last_mouse_down_x - canvas.offsetLeft, last_mouse_down_y - canvas.offsetTop, rad, 0, 2 * Math.PI)
      // ctxRef.current.closePath();
      // setDrawing(false);
      // ctx.fill()
      // ctx.translate(frameCount / 500, 0);
      // let pixels = ctx.getImageData(0, 0, width, height);

      // color.style.backgroundColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]
      //   })`;
      // color.style.borderColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]
      //   })`;


    });
    return
    // }, 2000);
  };

  const onMouseMove = ({ nativeEvent }) => {
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
          onMouseMove={onMouseMove}
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
      <header className="App-header">
        <p>
          Люблю Лизаню 💜
        </p>
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
