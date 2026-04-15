import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Organization } from '../../../../models/organization-partner/organization';
import { Partner } from '../../../../models/organization-partner/partner';
import { OrganizationService } from '../../../../services/organization.service';
import { PartnerService } from '../../../../services/partner.service';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss'
})
export class OrganizationFormComponent implements OnInit {
  organization: Organization = {
    name: '', acronyme: '', transportType: '',
    email: '', phoneNumber: '', website: '',
    logo: '', type: 'PUBLIC', status: 'ACTIVE', coverageType: 'BUS'
  };
  isEditMode = false;
  id?: number;

  governorates = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
    'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse',
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Gabes', 'Mednine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];
  selectedGovernorates: string[] = [];
  existingZones: any[] = [];

  allPartners: Partner[] = [];
  linkedPartners: Partner[] = [];
  existingContracts: any[] = [];
  showNewPartnerForm = false;
  newPartner: Partner = {
    name: '', industrySector: '', partnershipType: '',
    email: '', phoneNumber: '', website: '', logo: '', status: 'ACTIVE'
  };

  constructor(
    private organizationService: OrganizationService,
    private partnerService: PartnerService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.partnerService.getAll().subscribe({
      next: (data) => this.allPartners = data
    });

    if (this.id) {
      this.isEditMode = true;
      this.organizationService.getById(this.id).subscribe({
        next: (data) => this.organization = data
      });
      this.http.get<any[]>(`/api/zones/organization/${this.id}`).subscribe({
        next: (zones) => {
          this.existingZones = zones;
          this.selectedGovernorates = zones.map(z => z.governorate);
        }
      });
      // Load existing contracts to know which partners are linked
      this.http.get<any[]>(`/api/contracts/organization/${this.id}`).subscribe({
        next: (contracts) => {
          this.existingContracts = contracts;
          this.linkedPartners = contracts
            .filter(c => c.partnerId)
            .map(c => ({ id: c.partnerId, name: c.partnerName } as Partner));
        }
      });
    }
  }

  toggleGovernorate(gov: string): void {
    const idx = this.selectedGovernorates.indexOf(gov);
    if (idx === -1) this.selectedGovernorates.push(gov);
    else this.selectedGovernorates.splice(idx, 1);
  }

  isSelected(gov: string): boolean {
    return this.selectedGovernorates.includes(gov);
  }

  isPartnerLinked(partner: Partner): boolean {
    return this.linkedPartners.some(p => p.id === partner.id);
  }

  togglePartner(partner: Partner): void {
    if (this.isPartnerLinked(partner)) {
      this.linkedPartners = this.linkedPartners.filter(p => p.id !== partner.id);
    } else {
      this.linkedPartners.push(partner);
    }
  }

  addNewPartner(): void {
    this.partnerService.create({ ...this.newPartner, organizationId: this.id || null }).subscribe({
      next: (created) => {
        this.allPartners.push(created);
        this.linkedPartners.push(created);
        this.newPartner = { name: '', industrySector: '', partnershipType: '', email: '', phoneNumber: '', status: 'ACTIVE' };
        this.showNewPartnerForm = false;
      }
    });
  }

  save(): void {
    const saveOrg = (orgId: number) => {
      // Save zones
      const existing = this.existingZones.map(z => z.governorate);
      const toAdd = this.selectedGovernorates.filter(g => !existing.includes(g));
      const toRemove = this.existingZones.filter(z => !this.selectedGovernorates.includes(z.governorate));
      const zoneRequests = [
        ...toAdd.map(gov => this.http.post('/api/zones', {
          governorate: gov, region: 'NORTH', isHeadquarter: false,
          coverageType: this.organization.coverageType, organizationId: orgId
        }).toPromise()),
        ...toRemove.map(z => this.http.delete(`/api/zones/${z.id}`).toPromise())
      ];

      // Save partner links via contracts
      const existingPartnerIds = this.existingContracts.map(c => c.partnerId);
      const toLink = this.linkedPartners.filter(p => !existingPartnerIds.includes(p.id));
      const toUnlink = this.existingContracts.filter(c =>
        !this.linkedPartners.some(p => p.id === c.partnerId)
      );

      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      const contractRequests = [
        ...toLink.map(p => this.http.post('/api/contracts', {
          contractType: 'COMMERCIAL',
          status: 'ACTIVE',
          startDate: now.toISOString(),
          endDate: nextYear.toISOString(),
          description: `Contrat entre organisation ${orgId} et partenaire ${p.name}`,
          organizationId: orgId,
          partnerId: p.id
        }).toPromise()),
        ...toUnlink.map(c => this.http.delete(`/api/contracts/${c.id}`).toPromise())
      ];

      Promise.all([...zoneRequests, ...contractRequests]).then(() => {
        this.router.navigate(['/admin/organizations']);
      });
    };

    if (this.isEditMode && this.id) {
      this.organizationService.update(this.id, this.organization).subscribe({
        next: () => saveOrg(this.id!)
      });
    } else {
      this.organizationService.create(this.organization).subscribe({
        next: (org: any) => saveOrg(org.id)
      });
    }
  }
}
