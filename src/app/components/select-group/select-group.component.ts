import { Component, Input } from '@angular/core';
import { SelectItemGroup } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select-group',
  imports: [SelectModule],
  templateUrl: './select-group.component.html',
})
export class SelectGroup {

  @Input({required: true}) groupedItems: SelectItemGroup[] = [];
  @Input({ required: true }) formControlName = 'selectGroup';
  @Input() group: boolean = true;

}
