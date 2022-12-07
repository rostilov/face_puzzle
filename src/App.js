import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from 'react'

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

  const paintToCanvas = () => {
    let video = videoRef.current;

    let canvas = canvasRef.current;
    canvas.style.backgroundColor = 'rgb(138,43,226)'
    let ctx = canvas.getContext("2d");

    // const width = 320;
    const width = 450;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const vid_height = video.videoHeight;
    const vid_width = video.videoWidth;
    setInterval(() => {
      // let color = colorRef.current;

      // ctx.drawImage(video, 0, 0, width, height);
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
