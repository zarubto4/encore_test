// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';
import { Injectable } from '@angular/core';

export const environment = {
  appVersion: packageInfo.version,
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export interface ProductEnvironmentConfig {
  backend_url: string;
  application_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductEnvironment {
  private readonly currentURL: string;

  constructor() {
    this.currentURL = window.location.href;
  }

  public getProduct(): ProductEnvironmentConfig {
    const project: ProductEnvironmentConfig = {
      backend_url: 'localhost:4200',
      application_url: this.currentURL
    };

    return project;
  }
}
