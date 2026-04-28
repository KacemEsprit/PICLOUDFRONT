import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Contract } from '../../../../models/organization-partner/contract';
import { ContractService } from '../../../../services/contract.service';

@Component({
  selector: 'app-contract-form',
  
  
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss'
})
export class ContractFormComponent implements OnInit {

  contract: Contract = {
    contractType: 'COMMERCIAL',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    description: '',
    organizationId: 0,
    partnerId: 0
  };

  isEditMode = false;
  id?: number;

  constructor(
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEditMode = true;
      this.contractService.getById(this.id).subscribe({
        next: (data) => {
          this.contract = data;
          // ← Correction format date
          this.contract.startDate = this.formatDate(data.startDate);
          this.contract.endDate = this.formatDate(data.endDate);
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ← Fonction de conversion date
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  }

  save(): void {
    if (this.isEditMode && this.id) {
      this.contractService.update(this.id, this.contract).subscribe({
        next: () => this.router.navigate(['/admin/contracts']),
        error: (err) => console.error(err)
      });
    } else {
      this.contractService.create(this.contract).subscribe({
        next: () => this.router.navigate(['/admin/contracts']),
        error: (err) => console.error(err)
      });
    }
  }
}




