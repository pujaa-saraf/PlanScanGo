import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import User from './Interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  setUser(user: User | null) {
    this.userSubject.next(user);
  }
}