import { Component, OnInit } from '@angular/core';
import { Contract } from '../../../../models/organization-partner/contract';
import { ContractService } from '../../../../services/contract.service';
import { PaginationComponent } from '../../../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-contract-list',
  
  
  templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.scss'
})
export class ContractListComponent implements OnInit {

  contracts: Contract[] = [];
  paginatedContracts: Contract[] = [];
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.updatePage(1);
      },
      error: (err) => console.error(err)
    });
  }

  updatePage(page: number): void {
    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedContracts = this.contracts.slice(start, end);
  }

  delete(id: number): void {
    if (confirm('Do you want to delete this contract?')) {
      this.contractService.delete(id).subscribe({
        next: () => this.loadContracts(),
        error: (err) => console.error(err)
      });
    }
  }
}




