import { NgModule } from '@angular/core';

import { OrganizationsRoutingModule, routedComponents } from './organizations-routing.module';

@NgModule({
    declarations: [
        routedComponents
    ],
    imports: [
        [OrganizationsRoutingModule],
    ],
})
export class OrganizationsModule { }
