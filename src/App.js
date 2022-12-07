import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from 'react'

const Canvas = props => {

  const { draw, ...rest } = props
  const canvasRef = useRef(null)

  useEffect(() => {

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId

    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])

  return <canvas style={{ width: '600px' }} ref={canvasRef} {...rest} />
}
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
      ctx.drawImage(video, (width - vid_width) / 2, (height - vid_height) / 2);

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
          Люблю Лизаню ❤️
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
