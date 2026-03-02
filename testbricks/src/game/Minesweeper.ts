import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborCount: number;
  container: Container;
  bg: Graphics;
  content?: Graphics | Text;
}

interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export class Minesweeper {
  private app: Application;
  private rootContainer: Container;
  private gridContainer: Container;
  private uiContainer: Container;

  private rows: number = 10;
  private cols: number = 9;
  private mineTotal: number = 10;
  private cellSize: number = 40;
  private grid: Cell[][] = [];

  private difficulty: Difficulty = { name: 'EASY', rows: 10, cols: 9, mines: 10 };

  private gameOver: boolean = false;
  private firstClick: boolean = true;
  private startTime: number = 0;
  private timerInterval?: any;

  private mineCountText!: Text;
  private timerText!: Text;
  private statusText?: Text;

  constructor(app: Application) {
    this.app = app;
    this.rootContainer = new Container();
    this.gridContainer = new Container();
    this.uiContainer = new Container();

    this.app.stage.addChild(this.rootContainer);
    this.rootContainer.addChild(this.gridContainer);
    this.rootContainer.addChild(this.uiContainer);

    window.addEventListener('resize', () => this.handleResize());
  }

  public start(diff?: Difficulty) {
    if (diff) this.difficulty = diff;
    this.reset();
  }

  private reset() {
    this.rows = this.difficulty.rows;
    this.cols = this.difficulty.cols;
    this.mineTotal = this.difficulty.mines;

    this.gameOver = false;
    this.firstClick = true;
    this.startTime = 0;
    clearInterval(this.timerInterval);

    this.gridContainer.removeChildren();
    this.uiContainer.removeChildren();
    if (this.statusText) {
      this.app.stage.removeChild(this.statusText);
      this.statusText = undefined;
    }

    this.calculateLayout();
    this.createUI();
    this.createGrid();
    this.setupMines();
    this.preRevealCorners();
    this.handleResize();
  }

  private calculateLayout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const padding = 20;
    const headerH = 70;

    const availableW = width - padding;
    const availableH = height - headerH - padding;

    this.cellSize = Math.min(
      Math.floor(availableW / this.cols),
      Math.floor(availableH / this.rows),
      40
    );
    if (this.cellSize < 25) this.cellSize = 25;
  }

  private createUI() {
    const header = new Graphics()
      .rect(0, 0, window.innerWidth, 60)
      .fill(0x222222);
    this.uiContainer.addChild(header);

    const textStyle = new TextStyle({
      fill: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold'
    });

    this.mineCountText = new Text({ text: `🚩 ${this.mineTotal}`, style: { ...textStyle, fill: '#ffcc00' } });
    this.mineCountText.x = 20;
    this.mineCountText.y = 30;
    this.mineCountText.anchor.set(0, 0.5);
    this.uiContainer.addChild(this.mineCountText);

    this.timerText = new Text({ text: '⏱ 00:00', style: textStyle });
    this.timerText.x = window.innerWidth - 20;
    this.timerText.y = 30;
    this.timerText.anchor.set(1, 0.5);
    this.uiContainer.addChild(this.timerText);

    // Buttons
    const levels = [
      { id: 'E', name: 'EASY', color: 0x27ae60 },
      { id: 'M', name: 'MEDIUM', color: 0xe67e22 },
      { id: 'H', name: 'HARD', color: 0xc0392b }
    ];

    const isPC = window.innerWidth > 767;
    const btnScale = isPC ? 0.4 : 0.3;
    const spacing = 85 * btnScale + 5;
    const startX = window.innerWidth / 2 - (spacing * 1.5);

    levels.forEach((lvl, i) => {
      const btn = new Container();
      btn.x = startX + i * spacing;
      btn.y = 30;

      const isActive = this.difficulty.name === lvl.name;
      const bg = new Graphics()
        .roundRect(-40, -15, 80, 30, 8)
        .fill(isActive ? lvl.color : 0x000000);

      if (!isActive) bg.alpha = 0.5;

      const label = new Text({
        text: lvl.id,
        style: { fill: '#ffffff', fontSize: 14, fontWeight: 'bold' }
      });
      label.anchor.set(0.5);

      btn.addChild(bg, label);
      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => {
        let rows = lvl.id === 'E' ? 10 : 16;
        let cols = lvl.id === 'E' ? 9 : 16;
        if (lvl.id === 'H') {
          const isPortrait = window.innerWidth <= 767;
          rows = isPortrait ? 32 : 16;
          cols = isPortrait ? 16 : 32;
        }
        const mines = lvl.id === 'E' ? 10 : (lvl.id === 'M' ? 40 : 100);
        this.start({ name: lvl.name, rows, cols, mines });
      });

      this.uiContainer.addChild(btn);
    });

    // Reset Button
    const resetBtn = new Container();
    const resetX = startX + 3 * spacing;
    resetBtn.x = resetX;
    resetBtn.y = 30;
    const rBg = new Graphics().roundRect(-40, -15, 80, 30, 8).fill(0x333333);
    const rLabel = new Text({ text: 'R', style: { fill: '#ffffff', fontSize: 14, fontWeight: 'bold' } });
    rLabel.anchor.set(0.5);
    resetBtn.addChild(rBg, rLabel);
    resetBtn.eventMode = 'static';
    resetBtn.cursor = 'pointer';
    resetBtn.on('pointerdown', () => this.reset());
    this.uiContainer.addChild(resetBtn);
  }

  private createGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const cellContainer = new Container();
        cellContainer.x = c * this.cellSize;
        cellContainer.y = r * this.cellSize;

        const bg = new Graphics();
        this.drawCellBg(bg, false);
        cellContainer.addChild(bg);

        const cell: Cell = {
          r, c,
          isMine: false,
          revealed: false,
          flagged: false,
          neighborCount: 0,
          container: cellContainer,
          bg: bg
        };

        cellContainer.eventMode = 'static';
        cellContainer.on('pointerdown', (e) => this.onCellClick(cell, e));

        this.gridContainer.addChild(cellContainer);
        this.grid[r][c] = cell;
      }
    }
  }

  private drawCellBg(g: Graphics, revealed: boolean) {
    const padding = 1;
    g.clear();
    if (revealed) {
      g.roundRect(padding, padding, this.cellSize - padding * 2, this.cellSize - padding * 2, 4)
        .fill(0x222222)
        .stroke({ width: 1, color: 0x2a2a2a });
    } else {
      g.roundRect(padding, padding, this.cellSize - padding * 2, this.cellSize - padding * 2, 4)
        .fill(0x333333)
        .stroke({ width: 1, color: 0x444444 });
    }
  }

  private setupMines() {
    let placed = 0;
    const corners = [
      [0, 0], [0, this.cols - 1],
      [this.rows - 1, 0], [this.rows - 1, this.cols - 1]
    ];

    while (placed < this.mineTotal) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      const isCorner = corners.some(([cr, cc]) => cr === r && cc === c);
      if (!isCorner && !this.grid[r][c].isMine) {
        this.grid[r][c].isMine = true;
        placed++;
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine) {
          this.grid[r][c].neighborCount = this.getNeighbors(r, c).filter(n => n.isMine).length;
        }
      }
    }
  }

  private preRevealCorners() {
    const corners = [
      [0, 0], [0, this.cols - 1],
      [this.rows - 1, 0], [this.rows - 1, this.cols - 1]
    ];
    corners.forEach(([r, c]) => this.revealRecursive(r, c));
    this.firstClick = false;
    this.startTimer();
  }

  private onCellClick(cell: Cell, e: any) {
    if (this.gameOver) return;

    // Right click or Shift+Click for flagging
    if (e.button === 2 || e.shiftKey) {
      this.toggleFlag(cell);
      return;
    }

    if (cell.revealed) {
      this.handleChord(cell);
      return;
    }

    this.handleReveal(cell);
  }

  private handleReveal(cell: Cell) {
    if (cell.flagged || cell.revealed) return;

    if (cell.isMine) {
      this.revealMines();
      this.gameLost();
    } else {
      this.revealRecursive(cell.r, cell.c);
      this.checkWinCondition();
    }
  }

  private revealRecursive(r: number, c: number) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
    const cell = this.grid[r][c];
    if (cell.revealed || cell.flagged || cell.isMine) return;

    cell.revealed = true;
    this.drawCellBg(cell.bg, true);

    if (cell.neighborCount > 0) {
      const colors = [0, 0x3498db, 0x2ecc71, 0xe74c3c, 0x9b59b6, 0xf1c40f, 0x1abc9c, 0xe67e22, 0x34495e];
      const text = new Text({
        text: cell.neighborCount.toString(),
        style: {
          fill: colors[cell.neighborCount],
          fontSize: this.cellSize * 0.6,
          fontWeight: 'bold'
        }
      });
      text.anchor.set(0.5);
      text.x = this.cellSize / 2;
      text.y = this.cellSize / 2;
      cell.container.addChild(text);
      cell.content = text;
    } else {
      this.getNeighbors(r, c).forEach(n => this.revealRecursive(n.r, n.c));
    }
  }

  private toggleFlag(cell: Cell) {
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;

    if (cell.flagged) {
      const flag = new Graphics()
        .poly([{ x: this.cellSize / 2, y: this.cellSize / 4 }, { x: this.cellSize * 0.75, y: this.cellSize * 0.4 }, { x: this.cellSize / 2, y: this.cellSize * 0.55 }])
        .fill(0xffaa00)
        .rect(this.cellSize / 2 - 1, this.cellSize / 4, 2, this.cellSize / 2)
        .fill(0xdddddd);
      cell.container.addChild(flag);
      cell.content = flag;
    } else {
      if (cell.content) {
        cell.container.removeChild(cell.content);
        cell.content = undefined;
      }
    }
  }

  private handleChord(cell: Cell) {
    if (!cell.revealed || cell.neighborCount === 0) return;
    const neighbors = this.getNeighbors(cell.r, cell.c);
    const flags = neighbors.filter(n => n.flagged).length;
    if (flags === cell.neighborCount) {
      neighbors.forEach(n => this.handleReveal(n));
    }
  }

  private getNeighbors(r: number, c: number): Cell[] {
    const neighbors: Cell[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          neighbors.push(this.grid[nr][nc]);
        }
      }
    }
    return neighbors;
  }

  private revealMines() {
    this.grid.flat().forEach(cell => {
      if (cell.isMine && !cell.flagged) {
        this.drawCellBg(cell.bg, true);
        const mine = new Graphics()
          .circle(this.cellSize / 2, this.cellSize / 2, this.cellSize / 3)
          .fill(0xff4444)
          .circle(this.cellSize / 2, this.cellSize / 2, this.cellSize / 8)
          .fill(0x000000);
        cell.container.addChild(mine);
      } else if (!cell.isMine && cell.flagged) {
        const x = new Text({ text: 'X', style: { fill: 0xff0000, fontSize: this.cellSize * 0.6 } });
        x.anchor.set(0.5);
        x.x = this.cellSize / 2;
        x.y = this.cellSize / 2;
        cell.container.addChild(x);
      }
    });
  }

  private checkWinCondition() {
    const hidden = this.grid.flat().filter(c => !c.isMine && !c.revealed).length;
    if (hidden === 0) {
      this.gameOver = true;
      clearInterval(this.timerInterval);
      this.showStatus('🎉 YOU WIN!', '#f1c40f');
    }
  }

  private gameLost() {
    this.gameOver = true;
    clearInterval(this.timerInterval);
    this.showStatus('💀 GAME OVER', '#ff4444');
  }

  private showStatus(msg: string, color: string) {
    this.statusText = new Text({
      text: msg,
      style: {
        fill: color,
        fontSize: 48,
        fontWeight: 'bold',
        stroke: { color: '#000000', width: 6 }
      }
    });
    this.statusText.anchor.set(0.5);
    this.statusText.x = window.innerWidth / 2;
    this.statusText.y = 120;
    this.app.stage.addChild(this.statusText);
  }

  private startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      this.timerText.text = `⏱ ${m}:${s}`;
    }, 1000);
  }

  private handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);

    // Background update
    if (this.uiContainer.children[0]) {
      (this.uiContainer.children[0] as Graphics).width = width;
    }

    // UI repositioning
    if (this.timerText) this.timerText.x = width - 20;

    const isPC = width > 767;
    const btnScale = isPC ? 0.4 : 0.3;
    const spacing = 85 * btnScale + 5;
    const startX = width / 2 - (spacing * 1.5);

    // Reposition buttons
    // Index 3,4,5 are difficulty buttons, 6 is reset
    let btnIdx = 0;
    this.uiContainer.children.forEach((child, i) => {
      if (i >= 3 && i <= 5) {
        child.x = startX + btnIdx * spacing;
        btnIdx++;
      } else if (i === 6) { // Reset button
        child.x = startX + 3 * spacing;
      }
    });

    const boardW = this.cols * this.cellSize;
    this.gridContainer.x = Math.max(0, (width - boardW) / 2);
    this.gridContainer.y = 70;

    if (this.statusText) {
      this.statusText.x = width / 2;
    }
  }

  public setupCanvas() {
    this.app.canvas.oncontextmenu = (e) => e.preventDefault();
  }
}
