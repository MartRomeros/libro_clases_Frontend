import { Component } from '@angular/core';
import { Navbar } from '../../sections/navbar/navbar';
import { Hero } from '../../sections/hero/hero';
import { Admision } from '../../sections/admision/admision';
import { Utiles } from '../../sections/utiles/utiles';
import { Contact } from '../../sections/contact/contact';
import { Footer } from '../../sections/footer/footer';
import { About } from '../../sections/about/about';
import { Departments } from '../../sections/departments/departments';

@Component({
  selector: 'app-landing.page.component',
  imports: [Navbar, Hero, Admision, Utiles, Contact, Footer, About, Departments],
  templateUrl: './landing.page.component.html',
  styleUrl: './landing.page.component.css',
})
export class LandingPageComponent { }
