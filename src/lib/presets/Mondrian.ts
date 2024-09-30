export const Mondrian = `import { Module, getSeededRand } from "https://qr.kernelguardian.com/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  Foreground: {
    type: "array",
    props: {
      type: "color",
    },
    resizable: true,
    default: ["#860909", "#0e21a0", "#95800f"],
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  Lines: {
    type: "color",
    default: "#000000",
  },
  "Line thickness": {
    type: "number",
    min: -10,
    max: 10,
    default: 2,
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

export function renderSVG(qr, params) {
  const rand = getSeededRand(params["Seed"]);
  const margin = params["Margin"];

  const unit = 20;
  const matrixWidth = qr.version * 4 + 17 + 2 * margin;
  const size = matrixWidth * unit;

  const gap = params["Line thickness"];
  const offset = gap / 2;

  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}">\`;
  svg += \`<rect width="\${size}" height="\${size}" fill="\${params["Lines"]}"/>\`;

  let lightLayer = \`<path fill="\${params["Background"]}" d="\`;
  const darkLayers = params["Foreground"].map(
    (color) => \`<path fill="\${color}" d="\`
  );

  const visited = Array.from({ length: matrixWidth * matrixWidth }).fill(false);
  const matrix = Array.from({ length: matrixWidth * matrixWidth }).fill(0);
  const qrWidth = qr.version * 4 + 17;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (
        y >= margin &&
        y < matrixWidth - margin &&
        x >= margin &&
        x < matrixWidth - margin
      ) {
        matrix[y * matrixWidth + x] =
          qr.matrix[(y - margin) * qrWidth + (x - margin)];
      }
    }
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = matrix[y * matrixWidth + x];
      if (visited[y * matrixWidth + x]) continue;

      let layer = "";
      const on = module & Module.ON;
      visited[y * matrixWidth + x] = true;

      let width = 1;
      let height = 1;

      while (
        x + width < matrixWidth &&
        (matrix[y * matrixWidth + x + width] & Module.ON) === on &&
        !visited[y * matrixWidth + x + width]
      ) {
        visited[y * matrixWidth + x + width] = true;
        width++;
      }

      outer: while (y + height < matrixWidth) {
        for (let i = 0; i < width; i++) {
          if ((matrix[(y + height) * matrixWidth + x + i] & Module.ON) !== on) {
            break outer;
          }
        }

        for (let i = 0; i < width; i++) {
          visited[(y + height) * matrixWidth + x + i] = true;
        }
        height++;
      }

      const hSide = width * unit - gap;
      const vSide = height * unit - gap;
      layer += \`M\${x * unit + offset},\${y * unit + offset}h\${hSide}v\${vSide}h-\${hSide}z\`;

      if (on) {
        darkLayers[Math.floor(rand() * darkLayers.length)] += layer;
      } else {
        lightLayer += layer;
      }
    }
  }
  darkLayers.forEach((layer) => (svg += layer + \`"/>\`));
  svg += lightLayer + \`"/>\`;
  svg += \`</svg>\`;

  return svg;
}
`
