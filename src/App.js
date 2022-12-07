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
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      // let color = colorRef.current;
      frameCount++

      // ctx.drawImage(video, 0, 0, width, height);
      draw_circle_party(ctx, frameCount)
      const draw_part = (video, ctx, to_x, to_y, part_start_x, part_start_y, part_width, part_height) => {
        ctx.drawImage(video, part_start_x, part_start_y, part_width, part_height, to_x, to_y, part_width, part_height)
      }

      draw_part(video, ctx, 100 + 40 * Math.sin(-frameCount * 0.15), (height - vid_height) / 2 + 20 * Math.sin(frameCount * 0.05), 0, 0, vid_width / 2, vid_height)
      draw_part(video, ctx, 500 + 40 * Math.sin(frameCount * 0.1), 250 + 20 * Math.sin(-frameCount * 0.05), vid_width / 2, 0, vid_width / 2, vid_height / 2)
      draw_part(video, ctx, 400 + 40 * Math.sin(frameCount * 0.1), 50 + 10 * Math.sin(frameCount * 0.05), vid_width / 2, vid_height / 2, vid_width / 2, vid_height / 2)
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
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = mix(data[i], 221);
        data[i + 1] = mix(data[i + 1], 160);
        data[i + 2] = mix(data[i + 2], 221);
        data[i + 3] = mix(data[i + 2], 255);
      }
      // console.log(data.length);
      data = data.slice(0, data.length - 100000);
      // imageData.data = arr;
      ctx.putImageData(imageData, shift, 0);
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


  return (
    <div>
      <div>
        <video
          onCanPlay={() => paintToCanvas()}
          ref={videoRef}
          className="player"
        />
        <canvas ref={canvasRef} className="photo" />
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
