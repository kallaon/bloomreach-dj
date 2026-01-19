import { Component, Input } from '@angular/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-autocomplete',
  imports: [AutoCompleteModule],
  templateUrl: './autocomplete.component.html',
})
export class Autocomplete {
  @Input() showClear: boolean = true;
  @Input() dropdown: boolean = true;
  @Input({required: true}) suggestions: any[] = [];
  @Input({ required: true }) formControlName = 'autocomplete';


  search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        this.suggestions = this.suggestions.filter(item =>
          item.toLowerCase().includes(query)
        );
    }

}
