// angular import
import { Component, OnInit } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ProjectBackend } from '../../../backend/projectBackend.backend';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export default class SamplePageComponent implements OnInit {
  filterPageLastUse = 1;
  constructor(protected backendService: ProjectBackend) {
    console.log('SamplePageComponent::init');
  }

  ngOnInit(): void {
    console.log('SamplePageComponent::ngOnInit');
    this.refresh();
  }

  refresh = (pageNumber?: number): void => {
    if (pageNumber != null) {
      this.filterPageLastUse = pageNumber;
    }

    const result = this.backendService.client.globalDealFrameworkService_dealSchemaManager.dealTypeGetList({
      alias: 'alias'
    });

    console.log('SamplePageComponent::refresh:result', result);
  };
}
