import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Organization } from '../../../../models/organization-partner/organization';
import { OrganizationService } from '../../../../services/organization.service';
import { MapPickerComponent } from '../../../../components/shared/map-picker/map-picker.component';

@Component({
  selector: 'app-organization-form',
  
  
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss'
})
export class OrganizationFormComponent implements OnInit {

  organization: Organization = {
    name: '',
    acronyme: '',
    transportType: '',
    email: '',
    phoneNumber: '',
    website: '',
    logo: '',
    type: 'PUBLIC',
    status: 'ACTIVE',
    coverageType: 'BUS'
  };

  isEditMode = false;
  id?: number;

  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEditMode = true;
      this.organizationService.getById(this.id).subscribe({
        next: (data) => this.organization = data
      });
    }
  }

  onLocationSelected(gov: string): void {
    console.log('Selected governorate:', gov);
  }

  save(): void {
    if (this.isEditMode && this.id) {
      this.organizationService.update(this.id, this.organization).subscribe({
        next: () => this.router.navigate(['/admin/organizations'])
      });
    } else {
      this.organizationService.create(this.organization).subscribe({
        next: () => this.router.navigate(['/admin/organizations'])
      });
    }
  }
}




