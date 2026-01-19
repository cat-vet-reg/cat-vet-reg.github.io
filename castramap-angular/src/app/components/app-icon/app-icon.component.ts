import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import * as icons from 'lucide-angular';

@Component({
    selector: 'app-icon',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <lucide-icon 
      [img]="iconData" 
      [size]="size" 
      [strokeWidth]="strokeWidth" 
      [class]="className"
    ></lucide-icon>
  `,
    styles: [`:host { display: inline-flex; }`]
})
export class AppIconComponent {
    @Input() name: string = 'HelpCircle';
    @Input() size: number = 24;
    @Input() className: string = '';
    @Input() strokeWidth: number = 2;

    get iconData() {
        // PascalCase the name if it's not already
        // React names are usually PascalCase (e.g. LayoutDashboard)
        // If we receive kebab-case, we might need conversion.
        // Assuming React passes PascalCase as per "LayoutDashboard", "BookOpen".

        const icon = (icons as any)[this.name];
        if (!icon) {
            console.warn(`Icon not found: ${this.name}`);
            return (icons as any)['HelpCircle'];
        }
        return icon;
    }
}
