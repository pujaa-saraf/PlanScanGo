import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import User from '../Interface';
import { NgIf } from '@angular/common';
import { UserService } from '../user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit {
  user: User | null = null;

  @ViewChild('linksDiv') linksDiv!: ElementRef;

  constructor(private userService: UserService) {
    this.userService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngAfterViewInit() {
    const menuHeight = this.linksDiv.nativeElement.children.length * 2.5;
    this.linksDiv.nativeElement.style.setProperty('--menu-height', `${menuHeight}rem`);
  }
}
