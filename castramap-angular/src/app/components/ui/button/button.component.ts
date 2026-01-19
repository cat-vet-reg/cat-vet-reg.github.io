import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
// Import icons as needed or import all (not recommended for prod but easier here)
// For now assuming we might receive icon name string, but Lucide Angular works differently.
// Typically you import specific icons.
// The React code passes `iconName`. We might need a dynamic icon loader or a registry.
// For simplicity, we can just accept `iconName` and have a switch case or use a library that supports string names if available.
// Or we ask the user to pass the icon component itself.
// But the React code passes strings: "name={iconName}".
// We will use a dynamic approach or just a mapping for now.
import * as icons from 'lucide-angular';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.css']
})
export class ButtonComponent {
    @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'danger' = 'default';
    @Input() size: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'xl' = 'default';
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() loading = false;
    @Input() fullWidth = false;
    @Input() iconName: string | null = null;
    @Input() iconPosition: 'left' | 'right' = 'left';

    // Icon mapping helper
    get icon() {
        if (!this.iconName) return null;
        // @ts-ignore
        const icon = icons[this.toPascalCase(this.iconName)];
        return icon;
    }

    private toPascalCase(str: string) {
        return str.replace(/(^\w|-\w)/g, (clear) => clear.replace('-', '').toUpperCase());
    }
}
