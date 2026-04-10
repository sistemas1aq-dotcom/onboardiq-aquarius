import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="mb-4">
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-1.5">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <!-- Text / Number / Date / Email / Password -->
      <input
        *ngIf="isInputType"
        [type]="type"
        [placeholder]="placeholder"
        [required]="required"
        [disabled]="isDisabled"
        [value]="value ?? ''"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
      />

      <!-- Select -->
      <select
        *ngIf="type === 'select'"
        [required]="required"
        [disabled]="isDisabled"
        [value]="value ?? ''"
        (change)="onSelectChange($event)"
        (blur)="onTouched()"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1 disabled:bg-gray-50 bg-white transition-colors"
      >
        <option value="" disabled>{{ placeholder || 'Seleccionar...' }}</option>
        <option *ngFor="let opt of options" [value]="opt.value ?? opt">
          {{ opt.label ?? opt }}
        </option>
      </select>

      <!-- Textarea -->
      <textarea
        *ngIf="type === 'textarea'"
        [placeholder]="placeholder"
        [required]="required"
        [disabled]="isDisabled"
        [value]="value ?? ''"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
        rows="3"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1 disabled:bg-gray-50 resize-y transition-colors"
      ></textarea>

      <!-- File -->
      <div *ngIf="type === 'file'" class="relative">
        <input
          type="file"
          [required]="required"
          [disabled]="isDisabled"
          (change)="onFileChange($event)"
          class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue1/10 file:text-blue1 hover:file:bg-blue1/20 transition-colors"
        />
      </div>
    </div>
  `,
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: 'text' | 'select' | 'textarea' | 'file' | 'date' | 'number' | 'email' | 'password' = 'text';
  @Input() options: any[] = [];
  @Input() required: boolean = false;
  @Input() placeholder: string = '';

  value: any = '';
  isDisabled = false;
  onChange: (val: any) => void = () => {};
  onTouched: () => void = () => {};

  get isInputType(): boolean {
    return ['text', 'number', 'date', 'email', 'password'].includes(this.type);
  }

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = this.type === 'number' ? +target.value : target.value;
    this.onChange(this.value);
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    this.value = file;
    this.onChange(file);
  }
}
