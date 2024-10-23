import { Component } from '@angular/core';

@Component({
  selector: 'template-default-page',
  standalone: true,
  imports: [],
  template: `
    <div class="row">
      <div class="col-sm-12">
        <div #pageBody>
          <ng-content select="[pageBody]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DefaultPageComponent {}
