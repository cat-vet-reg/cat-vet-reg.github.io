import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    @Input() type: 'text' | 'email' | 'password' | 'checkbox' | 'radio' | 'date' | 'number' = 'text';
    @Input() label: string = '';
    @Input() description: string = '';
    @Input() error: string = '';
    @Input() required = false;
    @Input() id: string = '';
    @Input() name: string = '';

    // Internal value
    value: any = '';

    // CVA callbacks
    onChange: any = () => { };
    onTouch: any = () => { };

    // Generate random ID if not provided
    ngOnInit() {
        if (!this.id) {
            this.id = `input-${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    // Value accessor implementation
    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // Handle disabled state if needed, usually via [disabled] binding in template
    }

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        let val: any = target.value;
        if (this.type === 'checkbox') {
            val = target.checked;
        }
        this.value = val;
        this.onChange(val);
        this.onTouch();
    }
}
