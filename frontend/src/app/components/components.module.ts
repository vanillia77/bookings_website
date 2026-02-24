import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingListComponent } from './booking-form/booking-list/booking-list.component';
import { BookingEditComponent } from './booking-edit/booking-edit.component';

@NgModule({
    declarations: [
        BookingFormComponent,
        BookingListComponent,
        BookingEditComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    exports: [
        BookingFormComponent,
        BookingListComponent,
        BookingEditComponent
    ]
})
export class ComponentsModule { }
