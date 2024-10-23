// angular import
import { Component } from '@angular/core';
import { ProjectBackend } from './backend/projectBackend.backend';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // public props
  title = 'mantis-free-version';

  constructor(public backendService: ProjectBackend) {
    console.log('AppComponent::init');
  }
}
