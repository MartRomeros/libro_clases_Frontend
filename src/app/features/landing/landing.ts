import { Component } from '@angular/core';
import { Navbar } from '../../layout/navbar/navbar';
import { Hero } from './components/hero/hero';
import { About } from './components/about/about';
import { Department } from './components/department/department';
import { Admision } from './components/admision/admision';
import { Utiles } from './components/utiles/utiles';
import { Contact } from './components/contact/contact';
import { Footer } from '../../layout/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [Navbar, Hero, About, Department, Admision, Utiles, Contact, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing { }
