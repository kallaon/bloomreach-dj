import {
  Component,
  computed,
  forwardRef,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { SelectItemGroup } from 'primeng/api';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  CompareType,
  CompareTypeNumber,
  CompareTypeString,
} from '../../models';
import { SelectGroupComponent } from '../select-group/select-group.component';

@Component({
  selector: 'app-compare',
  imports: [SelectGroupComponent, ReactiveFormsModule, InputNumber, InputText],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompareComponent),
      multi: true,
    },
  ],
  templateUrl: './compare.component.html',
})
export class CompareComponent implements ControlValueAccessor, OnDestroy {
  readonly CompareType = CompareType;
  readonly CompareTypeNumber = CompareTypeNumber;
  readonly groupedItems: SelectItemGroup[] = [
    {
      label: '(T) String',
      value: CompareType.STRING,
      items: [
        { label: 'equals to', value: CompareTypeString.EQUALS },
        { label: 'does not equal', value: CompareTypeString.DOES_NOT_EQUAL },
        { label: 'contains', value: CompareTypeString.CONTAINS },
        {
          label: 'does not contain',
          value: CompareTypeString.DOES_NOT_CONTAIN,
        },
      ],
    },
    {
      label: '(#) Number',
      value: CompareType.NUMBER,
      items: [
        { label: 'equal to', value: CompareTypeNumber.EQUALS_TO },
        { label: 'in between', value: CompareTypeNumber.IN_BETWEEN },
        { label: 'less than', value: CompareTypeNumber.LESS_THAN },
        {
          label: 'greater than',
          value: CompareTypeNumber.GREATER_THAN,
        },
      ],
    },
  ];

  readonly form = new FormGroup({
    comparer: new FormControl(),
    value: new FormControl(),
    valueFrom: new FormControl(),
    valueTo: new FormControl(),
  });

  private _selectedComparerSignal = signal<string | null>(null);
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private _destroy$ = new Subject<void>();

  readonly isNumberType = computed(() =>
    Object.values(CompareTypeNumber).includes(
      this._selectedComparerSignal() as CompareTypeNumber,
    ),
  );

  readonly isStringType = computed(() =>
    Object.values(CompareTypeString).includes(
      this._selectedComparerSignal() as CompareTypeString,
    ),
  );

  readonly isInBetween = computed(
    () => this._selectedComparerSignal() === CompareTypeNumber.IN_BETWEEN,
  );

  constructor() {
    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      });

    this.form
      .get('comparer')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe((value) => {
        this._selectedComparerSignal.set(value);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  writeValue(value: any): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
      this._selectedComparerSignal.set(value.comparer ?? null);
    } else {
      this.form.reset();
      this._selectedComparerSignal.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
