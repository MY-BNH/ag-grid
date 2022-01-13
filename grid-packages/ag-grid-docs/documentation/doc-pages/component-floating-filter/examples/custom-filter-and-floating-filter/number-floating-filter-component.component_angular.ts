import { Component } from "@angular/core";

import { AgFloatingFilterComponent } from "@ag-grid-community/angular";
import { IFloatingFilterParams } from "@ag-grid-community/core";

@Component({
    selector: 'number-component',
    template: `&gt; <input style="width: 30px" type="number" min="0" [(ngModel)]="currentValue" (input)="onInputBoxChanged()"/>`
})
export class NumberFloatingFilterComponent implements AgFloatingFilterComponent {
    params!: IFloatingFilterParams;
    currentValue: Number | null | string = null;

    agInit(params: IFloatingFilterParams): void {
        this.params = params;
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null value here
        if (!parentModel) {
            this.currentValue = null;
        } else {
            this.currentValue = parentModel;
        }
    }

    onInputBoxChanged() {
        if (!!!this.currentValue) {
            // Remove the filter
            this.params.parentFilterInstance((instance: any) => {
                instance.myMethodForTakingValueFromFloatingFilter(null);
            });
            return;
        }

        this.params.parentFilterInstance((instance: any) => {
            instance.myMethodForTakingValueFromFloatingFilter(this.currentValue);
        });
    }
}
