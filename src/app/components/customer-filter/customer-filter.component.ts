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
import {
  Event,
  EventsResponse,
  PropertySuggestion,
  TypeSuggestion,
} from '../../models';
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
    CardModule,
    DividerModule,
  ],
  templateUrl: './customer-filter.component.html',
})
export class CustomerFilter implements OnInit, OnDestroy {
  protected eventData = signal<Event[]>([]);
  protected eventTypeSuggestions = signal<TypeSuggestion[]>([]);

  // hlavný FormArray obsahujúci všetky filter kroky
  protected formArray = new FormArray<FormGroup>([]);

  // cache pre property suggestions podľa event type
  private _propertyOptionsByType = new Map<string, PropertySuggestion[]>();

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

  // vráti property suggestions pre daný event type
  getPropertySuggestions(eventType: string): PropertySuggestion[] {
    return this._propertyOptionsByType.get(eventType) || [];
  }

  // pridá nový filter step (event type + jeho properties)
  onAdd() {
    const filterGroup = new FormGroup({
      type: new FormControl(),
      properties: new FormArray<FormGroup>([]),
    });

    this.setupTypeListener(filterGroup);
    this.formArray.push(filterGroup);
  }

  // pridá nový property filter do existujúceho stepu
  onAddProperty(stepIndex: number) {
    const step = this.formArray.at(stepIndex);
    const propertiesArray = step.get('properties') as FormArray;

    const propertyGroup = new FormGroup({
      property: new FormControl(),
      compare: new FormControl(),
    });

    propertiesArray.push(propertyGroup);
  }

  // odstráni konkrétny property filter z daného stepu
  onRemoveProperty(stepIndex: number, propertyIndex: number) {
    const step = this.formArray.at(stepIndex);
    const propertiesArray = step.get('properties') as FormArray;
    propertiesArray.removeAt(propertyIndex);
  }

  // odstráni celý filter step
  onRemove(index: number) {
    this.formArray.removeAt(index);
  }

  // naklonuje existujúci filter step vrátane všetkých jeho property filtrov
  onClone(index: number) {
    const controlToClone = this.formArray.at(index);
    const clonedValue = controlToClone.value;

    // vytvor nový FormGroup s rovnakými hodnotami
    const newFormGroup = new FormGroup({
      type: new FormControl(clonedValue.type),
      properties: new FormArray<FormGroup>([]),
    });

    // naklonuj všetky property filtre
    clonedValue.properties?.forEach((prop: any) => {
      const propertyGroup = new FormGroup({
        property: new FormControl(prop.property),
        compare: new FormControl(prop.compare),
      });
      (newFormGroup.get('properties') as FormArray).push(propertyGroup);
    });

    // setup listener pre type changes a vlož za originál
    this.setupTypeListener(newFormGroup);
    this.formArray.insert(index + 1, newFormGroup);
  }

  // handler pre submit - zatiaľ len loguje do konzoly
  onApplyFilters() {
    console.log('Filters applied:', this.formArray.value);
  }

  // helper metóda pre získanie properties FormArray z konkrétného stepu
  getPropertiesArray(stepIndex: number): FormArray {
    return this.formArray.at(stepIndex).get('properties') as FormArray;
  }

  // nastaví listener na zmenu event type ak sa zmeni tak premazem property
  private setupTypeListener(formGroup: FormGroup) {
    formGroup
      .get('type')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe((eventType) => {
        const propertiesArray = formGroup.get('properties') as FormArray;

        // ak user vymaže type, vyčistí všetky property filtre
        if (!eventType) {
          propertiesArray.clear();
        }
      });
  }

  // načíta autocomplete dáta z JSON súboru
  private _loadAutocompleteData() {
    this._dataService
      .getData<EventsResponse>('customer-events/events.json')
      .pipe(take(1))
      .subscribe((data) => {
        this.eventData.set(data.events);

        // vytvor unikátne event type suggestions
        this.eventTypeSuggestions.set(
          [...new Set(data.events.map((e) => e.type))].map((type) => ({
            value: type,
          })),
        );

        // vytvor property suggestions cache pre každý event type
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
