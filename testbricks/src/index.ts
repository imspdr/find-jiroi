import { Application } from 'pixi.js';
import { Minesweeper } from './game/Minesweeper';

(async () => {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: 0x1a1a1a,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  document.getElementById('game-container')?.appendChild(app.canvas);

  const game = new Minesweeper(app);
  game.setupCanvas();
  game.start();
})();
