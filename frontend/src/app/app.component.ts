// angular import
import { Component } from '@angular/core';
import { ProjectBackend } from './backend/projectBackend.backend';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  // public props
  title = 'mantis-free-version';

  constructor(public backendService: ProjectBackend) {
    console.log('AppComponent::init');
  }
}
