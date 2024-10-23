// angular import
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// project import
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './theme/shared/shared.module';
import { ProjectBackend } from './backend/projectBackend.backend';

@NgModule({
  declarations: [AppComponent],
  providers: [ProjectBackend],
  imports: [BrowserModule, AppRoutingModule, SharedModule, BrowserAnimationsModule],
  bootstrap: [AppComponent]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
