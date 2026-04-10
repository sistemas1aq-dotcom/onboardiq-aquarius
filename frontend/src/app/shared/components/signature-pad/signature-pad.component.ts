import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100">
        <h4 class="text-sm font-semibold text-gray-700">Firma Digital</h4>
      </div>
      <div class="p-4">
        <canvas
          #canvas
          class="w-full border-2 border-dashed border-gray-200 rounded-lg cursor-crosshair bg-gray-50"
          [width]="canvasWidth"
          [height]="canvasHeight"
          (mousedown)="startDraw($event)"
          (mousemove)="draw($event)"
          (mouseup)="endDraw()"
          (mouseleave)="endDraw()"
          (touchstart)="onTouchStart($event)"
          (touchmove)="onTouchMove($event)"
          (touchend)="endDraw()"
        ></canvas>
        <div class="flex items-center justify-between mt-3">
          <p class="text-xs text-gray-400">Dibuje su firma en el recuadro</p>
          <div class="flex gap-2">
            <button
              class="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              (click)="clear()"
            >Limpiar</button>
            <button
              class="px-4 py-1.5 text-xs font-medium text-white bg-blue1 rounded-lg hover:bg-blue2 transition-colors"
              (click)="save()"
            >Guardar Firma</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureSave = new EventEmitter<string>();

  canvasWidth = 500;
  canvasHeight = 200;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#0a1f3d';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Responsive resize
    this.resizeObserver = new ResizeObserver(() => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      this.canvasWidth = rect.width - 32; // padding
    });
    this.resizeObserver.observe(canvas.parentElement!);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  startDraw(event: MouseEvent): void {
    this.isDrawing = true;
    const { offsetX, offsetY } = event;
    this.ctx.beginPath();
    this.ctx.moveTo(offsetX, offsetY);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  endDraw(): void {
    this.isDrawing = false;
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing) return;
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    this.ctx.stroke();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  save(): void {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.signatureSave.emit(dataUrl);
  }
}
