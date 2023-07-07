import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import { OrganizationsModule } from '@organizations/organizations.module';
import { ProfilesModule } from '@profiles/profiles.module';

import { ExploreBodyComponent } from './components/explore-body/explore-body.component';
import { ExploreRoutingModule, routedComponents } from './explore-routing.module';
import { ExploreComponent } from './explore.component';

@NgModule({
  declarations: [routedComponents, ExploreComponent, ExploreBodyComponent],
  imports: [CommonModule, SharedModule, ExploreRoutingModule, OrganizationsModule, ProfilesModule],
})
export class ExploreModule {}
