import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerFilter } from './components/customer-filter/customer-filter.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomerFilter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
