import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExploreBodyComponent } from './components/explore-body/explore-body.component';
import { ExploreComponent } from './explore.component';

const routes: Routes = [
  {
    path: '',
    component: ExploreComponent,
    children: [{ path: '', component: ExploreBodyComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExploreRoutingModule {}

export const routedComponents = [ExploreComponent];
