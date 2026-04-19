import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importante para routerLink y router-outlet
import { Navbar } from "../../components/layout/navbar/navbar";
import { Footer } from "../../components/layout/footer/footer";

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer], // Añadimos RouterModule
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario {}