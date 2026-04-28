import { Component, OnInit } from '@angular/core';
import { Organization } from '../../../../models/organization-partner/organization';
import { OrganizationService } from '../../../../services/organization.service';

@Component({
  selector: 'app-operator-list',
  
  
  templateUrl: './operator-list.component.html',
  styleUrl: './operator-list.component.scss'
})
export class OperatorListComponent implements OnInit {

  operators: Organization[] = [];

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.organizationService.getAll().subscribe({
      next: (data) => this.operators = data,
      error: (err) => console.error(err)
    });
  }
}




