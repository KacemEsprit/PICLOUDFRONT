import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService, User } from "../../services/auth/auth.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-admin-dhasbord",
  templateUrl: "./admin-dhasbord.component.html",
  styleUrls: ["./admin-dhasbord.component.css"]
})
export class AdminDhasbordComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  stats: any = {
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalPartners: 0,
    activePartners: 0,
    totalContracts: 0,
    activeContracts: 0,
    signedContracts: 0,
    fraudContracts: 0,
    expiringContracts: 0,
    contractsByType: {},
    organizationsByCoverage: {}
  };

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser = this.authService.currentUserValue;
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.http.get<any>("/api/statistics/dashboard").subscribe({
      next: (data) => { this.stats = data; },
      error: (err) => { console.error("Error loading stats:", err); }
    });
  }

  getSignedPercentage(): number {
    if (!this.stats.totalContracts) return 0;
    return Math.round((this.stats.signedContracts / this.stats.totalContracts) * 100);
  }

  getFraudPercentage(): number {
    if (!this.stats.signedContracts) return 0;
    return Math.round((this.stats.fraudContracts / this.stats.signedContracts) * 100);
  }

  getPercent(value: any, total: any): number {
    const v = Number(value) || 0;
    const t = Number(total) || 1;
    return Math.round((v / t) * 100);
  }
}

