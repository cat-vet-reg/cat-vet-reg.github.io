import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppIconComponent } from '../../app-icon/app-icon.component'; // Adjust path

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [CommonModule, RouterModule, AppIconComponent],
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent {
    @Input() items: { label: string, path: string }[] | null = null;

    get breadcrumbItems() {
        return this.items || [{ label: 'Табло', path: '/dashboard-overview' }];
    }
}
