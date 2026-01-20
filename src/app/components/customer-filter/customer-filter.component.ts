import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected eventTypeSuggestions = signal<TypeSuggestion[]>([]);
  protected formArray = new FormArray<FormGroup>([]);

  private _eventData = signal<Event[]>([]);
  private _propertyOptionsByType = new Map<string, PropertySuggestion[]>();
  private _formGroupDestroys: Subject<void>[] = [];
  private readonly _dataService = inject(DataService);
  private readonly _destroy$ = new Subject<void>();

  ngOnInit() {
    this._loadDataAndMapItems();
    this.onAdd();
  }

  ngOnDestroy() {
    this._formGroupDestroys.forEach((destroy$) => {
      destroy$.next();
      destroy$.complete();
    });
    this._formGroupDestroys = [];

    this._destroy$.next();
    this._destroy$.complete();
  }

  // da mi property hodnoty na zaklade event hodnoty
  getPropertySuggestions(eventType: string): PropertySuggestion[] {
    return this._propertyOptionsByType.get(eventType) || [];
  }

  // vytvorí nový FG k tomu destroyer a lsitener +  push do pola
  onAdd() {
    const filterGroup = new FormGroup({
      type: new FormControl(),
      properties: new FormArray<FormGroup>([]),
    });

    const destroy$ = new Subject<void>();
    this._formGroupDestroys.push(destroy$);

    this._setupTypeListener(filterGroup, destroy$);
    this.formArray.push(filterGroup);
  }

  // pridá property/compare  filter do existujúceho stepu
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

  // odstráni celý step - row
  onRemove(index: number) {
    if (this.formArray.length <= 1) {
      return;
    }

    // del na memory leak
    const destroy$ = this._formGroupDestroys[index];
    if (destroy$) {
      destroy$.next();
      destroy$.complete();
    }

    this._formGroupDestroys.splice(index, 1);
    this.formArray.removeAt(index);
  }

  // naklonuje existujúci filter step vrátane všetkých jeho property filtrov
  onClone(index: number) {
    const controlToClone = this.formArray.at(index);
    const clonedValue = controlToClone.value;

    const newFormGroup = new FormGroup({
      type: new FormControl(clonedValue.type),
      properties: new FormArray<FormGroup>([]),
    });

    // property filtre
    clonedValue.properties?.forEach((prop: any) => {
      const propertyGroup = new FormGroup({
        property: new FormControl(prop.property),
        compare: new FormControl(prop.compare),
      });
      (newFormGroup.get('properties') as FormArray).push(propertyGroup);
    });

    const newIndex = index + 1;

    const destroy$ = new Subject<void>();
    this._formGroupDestroys.splice(newIndex, 0, destroy$);

    this._setupTypeListener(newFormGroup, destroy$);
    this.formArray.insert(newIndex, newFormGroup);
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
  private _setupTypeListener(formGroup: FormGroup, destroy$: Subject<void>) {
    formGroup
      .get('type')
      ?.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(destroy$),
        takeUntil(this._destroy$),
      )
      .subscribe((eventType) => {
        const propertiesArray = formGroup.get('properties') as FormArray;

        if (!eventType) {
          propertiesArray.clear();
        }
      });
  }

  // načíta data a spraví mapping
  private _loadDataAndMapItems() {
    this._dataService
      .getData<EventsResponse>('customer-events/events.json')
      .pipe(take(1))
      .subscribe((data) => {
        this._eventData.set(data.events);

        const typeSet = new Set<string>();

        data.events.forEach((event) => {
          typeSet.add(event.type);

          // k property suggestions pre tento typ ešte neni - pridaj
          if (!this._propertyOptionsByType.has(event.type)) {
            debugger;
            const suggestions = event.properties.map((prop) => ({
              value: prop.property,
              label: prop.property,
            }));
            this._propertyOptionsByType.set(event.type, suggestions);
          }
        });

        this.eventTypeSuggestions.set(
          Array.from(typeSet).map((type) => ({ value: type })),
        );
      });
  }
}
