import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataService } from '../../services/data-service/data-service';
import { CompareComponent } from '../compare/compare.component';

@Component({
  selector: 'app-customer-filter',
  imports: [ButtonModule, CompareComponent],
  templateUrl: './customer-filter.component.html',
})
export class CustomerFilter implements OnInit {

  private readonly dataService = inject(DataService);

  ngOnInit() {
    this.dataService.getData<any[]>('customer-events/events.json').subscribe(data => {
      console.log('Fetched customers:', data);
    });
  }

  onApplyFilters() {
    console.log('Filters applied');
  }

}
