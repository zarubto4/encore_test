import { Component } from '@angular/core';
import { SharedModule } from '../theme/shared/shared.module';

@Component({
  selector: 'template-default-page',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="row">
      <div class="col-sm-12">
        <div #pageBody></div>
      </div>
    </div>
  `,
  styleUrls: ['./sample-page.component.scss']
})
export default class SamplePageComponent {}
