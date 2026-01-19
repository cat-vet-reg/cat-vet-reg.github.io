import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/ui/header/header.component';
import { BreadcrumbComponent } from '../../components/ui/breadcrumb/breadcrumb.component';
import { AppIconComponent } from '../../components/app-icon/app-icon.component';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { CatService } from '../../services/cat.service';
import { complicationOptions } from '../../constants/form-options';

// Simple chart component (ported from React)
@Component({
  selector: 'app-complications-simple-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!data || data.length === 0" class="bg-card rounded-xl shadow-warm p-6 mb-8 border border-dashed border-slate-300">
      <h2 class="text-xl font-semibold mb-2 text-foreground">Топ усложнения</h2>
      <p class="text-muted-foreground text-sm italic">В момента няма записани специфични усложнения в базата данни.</p>
    </div>

    <div *ngIf="data && data.length > 0" class="bg-card rounded-xl shadow-warm p-6 mb-8 border border-destructive/10">
      <h2 class="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
        <span class="w-2 h-6 bg-destructive rounded-full"></span>
        Анализ на усложненията
      </h2>
      <div class="space-y-4">
        <div *ngFor="let item of data.slice(0, 5)">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-muted-foreground font-medium">{{ item.name }}</span>
            <span class="text-foreground">{{ item.count }} случая</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 text-[0px]">
            <div 
              class="bg-destructive h-2 rounded-full transition-all duration-500" 
              [style.width.%]="(item.count / 10) * 100 > 5 ? (item.count / 10) * 100 : 5"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplicationsSimpleChartComponent {
  @Input() data: any[] = [];
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, BreadcrumbComponent, AppIconComponent, ButtonComponent, ComplicationsSimpleChartComponent],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit {
  stats: any = {
    total: 0,
    recent: 0,
    locations: 0,
    newLocations: 0,
    rate: 0,
    complicationsChartData: []
  };
  isLoading = true;
  statsData: any[] = [];

  // Quick Actions
  quickActions = [
    {
      title: "Регистрирай Нова Котка",
      description: "Добави нова котка в регистъра с пълна информация и локацията",
      icon: "Plus",
      iconColor: "var(--color-primary)",
      path: "/cat-registration-form"
    },
    {
      title: "Виж интерактивна карта",
      description: "Виж регистрираните котки на картата, показваща техните локации",
      icon: "Map",
      iconColor: "var(--color-secondary)",
      path: "/interactive-cat-map"
    },
    {
      title: "Търси в регистъра",
      description: "Виж целия списък на регистрираните котки с търсачка и опции за филтриране.",
      icon: "List",
      iconColor: "var(--color-accent)",
      path: "/cat-registry-list"
    }
  ];

  /* constructor/inject */
  private catService = inject(CatService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      const response = await this.catService.getCats();
      const realCats = response.data || [];
      this.calculateStats(realCats);
    } catch (err) {
      console.error("Грешка при зареждане на таблото:", err);
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats(realCats: any[]) {
    const total = realCats.length;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Recent (last month)
    const recent = realCats.filter(cat => new Date(cat.created_at) > monthAgo).length;

    // Locations logic
    const allLocations = new Set(realCats.map(cat => cat.location_address).filter(Boolean));
    const totalLocationsCount = allLocations.size;

    const oldLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) < oneWeekAgo)
        .map(cat => cat.location_address)
        .filter(Boolean)
    );

    const recentLocations = new Set(
      realCats
        .filter(cat => new Date(cat.created_at) >= oneWeekAgo)
        .map(cat => cat.location_address)
        .filter(Boolean)
    );

    const newLocationsCount = [...Array.from(recentLocations)].filter((loc: unknown) => !oldLocations.has(loc)).length;

    // Rate logic
    const hasComplicationsCount = realCats.filter(cat => {
      const val = cat?.hasComplications || cat?.has_complications || cat?.complications;
      return val?.toString().toUpperCase() === 'Y';
    }).length;
    const rate = total > 0 ? ((hasComplicationsCount / total) * 100).toFixed(1) : '0';

    // Complications Chart Data
    const counts: { [key: string]: number } = {};

    realCats.forEach(cat => {
      const selected = cat?.selected_complications || cat?.selectedComplications || [];
      let complicationsArray: any[] = [];

      if (Array.isArray(selected)) {
        complicationsArray = selected;
      } else if (typeof selected === 'string' && selected.startsWith('[')) {
        try {
          complicationsArray = JSON.parse(selected);
        } catch (e) {
          complicationsArray = [];
        }
      }

      complicationsArray.forEach(id => {
        if (id) {
          counts[id] = (counts[id] || 0) + 1;
        }
      });
    });

    const allOptions = [
      ...(complicationOptions?.female || []),
      ...(complicationOptions?.male || []),
      ...(complicationOptions?.general || [])
    ];

    const complicationsChartData = Object.keys(counts).map(id => {
      const option = allOptions.find(opt => opt.id === id);
      return {
        name: option ? option.label : id,
        count: counts[id]
      };
    }).sort((a, b) => b.count - a.count);

    // Set stats
    this.stats = { total, recent, locations: totalLocationsCount, newLocations: newLocationsCount, rate, complicationsChartData };

    // Prepare view cards
    this.statsData = [
      {
        title: "Брой Регистрирани Котки",
        value: this.stats.total.toString(),
        icon: "Cat",
        iconColor: "var(--color-primary)"
      },
      {
        title: "Скорошни регистрирани котки",
        value: this.stats.recent.toString(),
        change: `+${this.stats.recent}`,
        changeType: "positive",
        trend: "този месец",
        icon: "TrendingUp",
        iconColor: "var(--color-success)"
      },
      {
        title: "Активни локации",
        value: this.stats.locations.toString(),
        change: `+${this.stats.newLocations}`,
        changeType: "positive",
        trend: "от миналата седмица",
        icon: "MapPin",
        iconColor: "var(--color-secondary)"
      },
      {
        title: "Усложнения",
        value: `${this.stats.rate}%`,
        change: Number(this.stats.rate) > 5 ? "Внимание" : "Нормално",
        changeType: Number(this.stats.rate) > 5 ? "negative" : "positive",
        icon: "AlertTriangle",
        iconColor: Number(this.stats.rate) > 5 ? "var(--color-destructive)" : "var(--color-warning)"
      }
    ];
  }
}
