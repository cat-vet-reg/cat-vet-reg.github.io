import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ButtonComponent } from '../button/button.component'; // Adjust path
import { AppIconComponent } from '../../app-icon/app-icon.component'; // Adjust path
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonComponent, AppIconComponent],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    isMobileMenuOpen = false;

    navigationItems = [
        { label: 'Табло', path: '/dashboard-overview', icon: 'LayoutDashboard' },
        { label: 'Регистрирани', path: '/cat-registry-list', icon: 'BookOpen' },
        { label: 'Карта', path: '/interactive-cat-map', icon: 'Map' },
    ];

    constructor(private router: Router) {
        // Scroll to top on navigation or logic handling?
        // React had ScrollToTop component. We might need that global logic.
        // For isActivePath, we can use router url or RouterLinkActive in template.
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }
}
