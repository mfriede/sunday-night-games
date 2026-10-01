import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const destination = new URL("../public/animations/", import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(
  join(dirname(require.resolve("@rive-app/canvas")), "rive.wasm"),
  new URL("rive.wasm", destination),
);
