import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
//import {bootstrap}    from 'angular2/platform/browser'
import { AppModule } from './app/app.module';
import {ClientComponent} from './components/client.component'
// Add all operators to Observable
import 'rxjs/Rx';


const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);