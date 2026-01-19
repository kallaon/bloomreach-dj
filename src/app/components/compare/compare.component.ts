import { Component } from '@angular/core';
import { SelectItemGroup } from 'primeng/api';
import { CompareTypeString } from '../../models';
import { SelectGroup } from '../select-group/select-group.component';

@Component({
  selector: 'app-compare',
  imports: [SelectGroup],
  templateUrl: './compare.component.html',
})
export class CompareComponent {

  readonly groupedItems: SelectItemGroup[] = [{
                        label: 'String',
                        value: 'string',
                        items: [
                          { label: 'equals to', value: CompareTypeString.EQUALS },
                          { label: 'does not equal', value: CompareTypeString.DOES_NOT_EQUAL },
                          { label: 'contains', value: CompareTypeString.CONTAINS },
                          { label: 'does not contain', value: CompareTypeString.DOES_NOT_CONTAIN },
                        ]
                    }];


}
