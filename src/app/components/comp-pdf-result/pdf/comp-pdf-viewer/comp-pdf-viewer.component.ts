import {
  Component,
  Input,
  signal,
  AfterViewInit
} from '@angular/core';

import { CompPdfViewerPageComponent } from '../comp-pdf-viewer-page/comp-pdf-viewer-page.component';
import { PdfPage } from '../../../../models/pdf-page.model';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'comp-pdf-viewer',
  standalone: true,
  imports: [CompPdfViewerPageComponent, NgComponentOutlet],
  templateUrl: './comp-pdf-viewer.component.html',
  styleUrls: ['./comp-pdf-viewer.component.css']
})
export class CompPdfViewerComponent implements AfterViewInit {

  @Input({ required: true }) pages!: PdfPage[];

  // ✅ zoom signal
  zoom = signal(1);

  minZoom = 0.5;
  maxZoom = 2;

  readonly pageWidth = 794;
  readonly pageHeight = 1123;
  readonly pageGap = 16;
  readonly pagePadding = 32;

  // ✅ DRAG STATE
  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  ngAfterViewInit() {
    const container = this.getContainer();
    if (!container) return;

    // ✅ ResizeObserver pour recalculer le zoom quand le container devient visible
    const resizeObserver = new ResizeObserver(() => {
      this.calculateMinZoom();
    });
    resizeObserver.observe(container);

    // ✅ CTRL + WHEEL ZOOM (mouse centered)
    container.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        if (!event.ctrlKey) return;

        event.preventDefault();

        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        this.applyZoomAt(event, delta);
      },
      { passive: false }
    );
  }

  // ✅ UTIL
  private getContainer(): HTMLElement | null {
    return document.getElementById('pdfScrollContainer');
  }

  // ✅ ZOOM BUTTONS (centered screen)
  zoomIn() {
    this.applyZoom(0.1);
  }

  zoomOut() {
    this.applyZoom(-0.1);
  }

  // ✅ ZOOM centered (screen center)
  applyZoom(delta: number) {
    const container = this.getContainer();
    if (!container) return;

    const prevZoom = this.zoom();

    const newZoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, Number((prevZoom + delta).toFixed(1)))
    );

    if (newZoom === prevZoom) return;

    const centerX = container.scrollLeft + container.clientWidth / 2;
    const centerY = container.scrollTop + container.clientHeight / 2;

    const ratio = newZoom / prevZoom;

    this.zoom.set(newZoom);

    requestAnimationFrame(() => {
      container.scrollLeft = centerX * ratio - container.clientWidth / 2;
      container.scrollTop = centerY * ratio - container.clientHeight / 2;
    });
  }

  // ✅ ZOOM sous la souris (🔥 PRO)
  applyZoomAt(event: WheelEvent, delta: number) {
    const container = this.getContainer();
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const prevZoom = this.zoom();

    const newZoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, Number((prevZoom + delta).toFixed(1)))
    );

    if (newZoom === prevZoom) return;

    const offsetX = (container.scrollLeft + mouseX) / prevZoom;
    const offsetY = (container.scrollTop + mouseY) / prevZoom;

    this.zoom.set(newZoom);

    requestAnimationFrame(() => {
      container.scrollLeft = offsetX * newZoom - mouseX;
      container.scrollTop = offsetY * newZoom - mouseY;
    });
  }

  // ✅ DRAG (pan PDF)
  onMouseDown(event: MouseEvent) {
    if (this.zoom() <= 1) return;

    const container = this.getContainer();
    if (!container) return;

    this.isDragging = true;
    container.classList.add('dragging');

    this.startX = event.pageX;
    this.startY = event.pageY;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const container = this.getContainer();
    if (!container) return;

    const dx = event.pageX - this.startX;
    const dy = event.pageY - this.startY;

    container.scrollLeft = this.scrollLeft - dx;
    container.scrollTop = this.scrollTop - dy;
  }

  onMouseUp() {
    const container = this.getContainer();
    if (container) {
      container.classList.remove('dragging');
    }
    this.isDragging = false;
  }

  // ✅ AUTO FIT WIDTH
  calculateMinZoom() {
    const container = this.getContainer();
    if (!container) return;

    const availableWidth = container.clientWidth - this.pagePadding;

    let ratio = availableWidth / this.pageWidth;
    ratio = Math.floor(ratio * 10) / 10;

    this.minZoom = Math.max(ratio, 0.1);

    if (this.zoom() > this.minZoom) {
      this.zoom.set(this.minZoom);

      requestAnimationFrame(() => {
        this.centerScroll(container);
      });
    }
  }

  centerScroll(container: HTMLElement) {
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    container.scrollLeft = Math.max(0, maxScrollLeft / 2);
  }

  getZoomPercent(): number {
    return Math.round(this.zoom() * 100);
  }
}