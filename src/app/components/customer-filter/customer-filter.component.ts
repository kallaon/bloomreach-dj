import { JsonPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
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
export class CustomerFilter implements OnInit, OnDestroy {
  protected eventData = signal<Event[]>([]);
  protected eventTypeSuggestions = signal<any[]>([]);
  protected formArray = new FormArray<FormGroup>([]);
  protected showPropertySelector: boolean[] = [];
  protected propertySuggestionsCache: Map<number, any[]> = new Map();

  private _propertyOptionsByType = new Map<string, any[]>();
  private readonly _dataService = inject(DataService);
  private readonly _destroy$ = new Subject<void>();

  ngOnInit() {
    this._loadAutocompleteData();
    this.onAdd();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getPropertySuggestions(index: number): any[] {
    return this.propertySuggestionsCache.get(index) || [];
  }

  onAdd() {
    const filterGroup = new FormGroup({
      type: new FormControl(),
      property: new FormControl({ value: null, disabled: true }),
      compare: new FormControl(),
    });

    const currentIndex = this.formArray.length;
    this.setupTypeListener(filterGroup, currentIndex);

    this.formArray.push(filterGroup);
    this.showPropertySelector.push(false);
  }

  onClone(index: number): void {
    const controlToClone = this.formArray.at(index);
    const clonedValue = controlToClone.value;

    const newFormGroup = new FormGroup({
      type: new FormControl(clonedValue.type),
      property: new FormControl({
        value: clonedValue.property,
        disabled: !clonedValue.type,
      }),
      compare: new FormControl(clonedValue.compare),
    });

    const newIndex = index + 1;

    const eventType = clonedValue.type;
    if (eventType) {
      const suggestions = this._propertyOptionsByType.get(eventType) || [];
      this.propertySuggestionsCache.set(newIndex, suggestions);
    }

    this.showPropertySelector.splice(
      newIndex,
      0,
      this.showPropertySelector[index] || false,
    );

    this.setupTypeListener(newFormGroup, newIndex);
    this.formArray.insert(newIndex, newFormGroup);
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

  private setupTypeListener(
    formGroup: FormGroup,
    index: number,
    skipInitialReset = false,
  ) {
    formGroup
      .get('type')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe((eventType) => {
        const property = formGroup.get('property');

        if (eventType) {
          const suggestions = this._propertyOptionsByType.get(eventType) || [];
          this.propertySuggestionsCache.set(index, suggestions);
          property?.enable();
        } else {
          property?.disable();
          this.propertySuggestionsCache.delete(index);
        }

        if (!skipInitialReset) {
          property?.setValue(null);
          this.showPropertySelector[index] = false;
        }
      });
  }

  private _loadAutocompleteData() {
    this._dataService
      .getData<EventsResponse>('customer-events/events.json')
      .pipe(take(1))
      .subscribe((data) => {
        this.eventData.set(data.events);

        this.eventTypeSuggestions.set(
          [...new Set(data.events.map((e) => e.type))].map((type) => ({
            value: type,
          })),
        );

        data.events.forEach((event) => {
          const suggestions = event.properties.map((prop) => ({
            value: prop.property,
            label: prop.property,
          }));
          this._propertyOptionsByType.set(event.type, suggestions);
        });
      });
  }
}
