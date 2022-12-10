export function canvas_arrow(ctx, fromx, fromy, dx, dy, length) {
  ctx.beginPath();
  const headlen = 10; // length of head in pixels
  const tox = fromx + dx * length;
  const toy = fromy + dy * length;
  const angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

export function draw_sector_line(ctx, x_shift) {
  const imageData = ctx.getImageData(x_shift, 0, ctx.canvas.width / 5, ctx.canvas.height);
  let data = imageData.data;

  const mix = (lhs, rhs) => {
    const alpha = 0.8;
    return alpha * lhs + (1 - alpha) * rhs;
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = mix(data[i], 221);
    data[i + 1] = mix(data[i + 1], 160);
    data[i + 2] = mix(data[i + 2], 221);
    data[i + 3] = mix(data[i + 2], 255);
  }
  ctx.putImageData(imageData, x_shift, 0);
}


export function draw_circle_party(ctx, frameCount) {
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
      if ((x % pixel_step === 0) && (y % pixel_step === 0)) {
        draw_circle(ctx, frameCount, x, y, (x + y) / 500)
      }
    }
  }

  ctx.fill()
}