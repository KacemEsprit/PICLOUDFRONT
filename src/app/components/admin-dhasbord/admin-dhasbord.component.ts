import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dhasbord',
  templateUrl: './admin-dhasbord.component.html',
  styleUrls: ['./admin-dhasbord.component.css']
})
export class AdminDhasbordComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser = this.authService.currentUserValue;
  }
}
