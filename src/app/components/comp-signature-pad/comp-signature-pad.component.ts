import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'comp-signature-pad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comp-signature-pad.component.html',
  styleUrls: ['./comp-signature-pad.component.css']
})
export class CompSignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signed = new EventEmitter<string>(); // base64

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.bindEvents(canvas);
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);
    this.ctx.scale(ratio, ratio);
    this.clear();
  }

  bindEvents(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', (e) => { this.drawing = true; const r = canvas.getBoundingClientRect(); this.lastX = e.clientX - r.left; this.lastY = e.clientY - r.top; });
    canvas.addEventListener('pointermove', (e) => { if (!this.drawing) return; const r = canvas.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top; this.ctx.beginPath(); this.ctx.moveTo(this.lastX, this.lastY); this.ctx.lineTo(x, y); this.ctx.stroke(); this.lastX = x; this.lastY = y; });
    canvas.addEventListener('pointerup', () => this.drawing = false);
    canvas.addEventListener('pointerleave', () => this.drawing = false);
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  save() {
    const canvas = this.canvasRef.nativeElement;
    const data = canvas.toDataURL('image/png');
    this.signed.emit(data);
  }
}
