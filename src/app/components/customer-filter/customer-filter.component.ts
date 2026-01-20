// import { JsonPipe } from '@angular/common';
// import { Component, computed, inject, OnInit, signal } from '@angular/core';
// import {
//   FormArray,
//   FormControl,
//   FormGroup,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { distinctUntilChanged, take } from 'rxjs';
// import { Event, EventsResponse } from '../../models';
// import { DataService } from '../../services/data-service/data-service';
// import { CompareComponent } from '../compare/compare.component';
// import { SelectFilterComponent } from '../select-filter/select-filter.component';

// interface AutocompleteSuggestion {
//   label: string;
//   value: string | number;
// }

// @Component({
//   selector: 'app-customer-filter',
//   imports: [
//     ReactiveFormsModule,
//     ButtonModule,
//     CompareComponent,
//     SelectFilterComponent,
//     JsonPipe,
//   ],
//   templateUrl: './customer-filter.component.html',
// })
// export class CustomerFilter implements OnInit {
//   private readonly dataService = inject(DataService);

//   protected formArray = new FormArray([]);
//   protected formGroup = new FormGroup({
//     type: new FormControl(),
//     property: new FormControl(),
//     compare: new FormControl(),
//   });
//   eventData = signal<Event[]>([]);

//   eventTypeSuggestions = computed<any[]>(() =>
//     [...new Set(this.eventData().map((e) => e.type))].map((type) => ({
//       value: type,
//     })),
//   );

//   ngOnInit() {
//     this._loadAutocompleteData();

//     this.formGroup
//       .get('autocomplete')
//       ?.valueChanges.pipe(distinctUntilChanged())
//       .subscribe((value) => {
//         console.log('Autocomplete value changed:', value);
//       });
//   }

//   onApplyFilters() {
//     console.log('Filters applied');
//   }

//   onAdd() {}

//   private _loadAutocompleteData() {
//     this.dataService
//       .getData<EventsResponse>('customer-events/events.json')
//       .pipe(take(1))
//       .subscribe((data) => {
//         console.log('Fetched customers:', data.events);
//         this.eventData.set(data.events);
//       });
//   }
// }

import { JsonPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { distinctUntilChanged, take } from 'rxjs';
import { Event, EventsResponse } from '../../models';
import { DataService } from '../../services/data-service/data-service';
import { CompareComponent } from '../compare/compare.component';
import { SelectFilterComponent } from '../select-filter/select-filter.component';

@Component({
  selector: 'app-customer-filter',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CompareComponent,
    SelectFilterComponent,
    JsonPipe,
    CardModule,
    DividerModule,
  ],
  templateUrl: './customer-filter.component.html',
})
export class CustomerFilter implements OnInit {
  private readonly dataService = inject(DataService);

  protected formArray = new FormArray<FormGroup>([]);
  protected showPropertySelector: boolean[] = [];
  protected propertySuggestionsCache: Map<number, any[]> = new Map();

  eventData = signal<Event[]>([]);

  // Event type suggestions (same for all rows)
  eventTypeSuggestions = computed<any[]>(() =>
    [...new Set(this.eventData().map((e) => e.type))].map((type) => ({
      value: type,
    })),
  );

  ngOnInit() {
    this._loadAutocompleteData();
    this.onAdd(); // Add first row by default
  }

  // Get property suggestions for specific row based on selected event type
  getPropertySuggestions(index: number): any[] {
    return this.propertySuggestionsCache.get(index) || [];
  }

  onAdd() {
    const filterGroup = new FormGroup({
      type: new FormControl(),
      property: new FormControl({ value: null, disabled: true }),
      // compare: new FormControl({ value: null, disabled: true }),
      compare: new FormControl(),
    });

    const currentIndex = this.formArray.length;

    // Listen to type changes and load property suggestions
    filterGroup
      .get('type')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        const property = filterGroup.get('property');

        if (value) {
          // Load and cache property suggestions for this event type
          const event = this.eventData().find((e) => e.type === value);
          if (event) {
            const suggestions = event.properties.map((prop) => ({
              value: prop.property,
              label: prop.property,
            }));
            this.propertySuggestionsCache.set(currentIndex, suggestions);
          }
          property?.enable();
        } else {
          property?.disable();
          this.propertySuggestionsCache.delete(currentIndex);
        }

        property?.setValue(null);
        this.showPropertySelector[currentIndex] = false;
      });

    this.formArray.push(filterGroup);
    this.showPropertySelector.push(false);
  }

  onShowPropertySelector(index: number) {
    if (this.propertySuggestionsCache.has(index)) {
      this.showPropertySelector[index] = true;
    }
  }

  onRemove(index: number) {
    this.formArray.removeAt(index);
    this.showPropertySelector.splice(index, 1);
    this.propertySuggestionsCache.delete(index);
  }

  onApplyFilters() {
    console.log('Filters applied:', this.formArray.value);
  }

  private _loadAutocompleteData() {
    this.dataService
      .getData<EventsResponse>('customer-events/events.json')
      .pipe(take(1))
      .subscribe((data) => {
        console.log('Fetched customers:', data.events);
        this.eventData.set(data.events);
      });
  }
}
