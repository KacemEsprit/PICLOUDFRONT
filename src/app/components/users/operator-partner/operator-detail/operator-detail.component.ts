import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Organization } from '../../../../models/organization-partner/organization';
import { OrganizationService } from '../../../../services/organization.service';
import { HttpClient } from '@angular/common/http';
import { MapComponent } from '../../../../components/shared/map/map.component';

@Component({
  selector: 'app-operator-detail',
  
  
  templateUrl: './operator-detail.component.html',
  styleUrl: './operator-detail.component.scss'
})
export class OperatorDetailComponent implements OnInit {

  operator?: Organization;
  zones: any[] = [];

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.organizationService.getById(id).subscribe({
      next: (data) => this.operator = data
    });
    this.http.get<any[]>(`http://localhost:8081/api/zones/organization/${id}`).subscribe({
      next: (data) => this.zones = data
    });
  }
}




