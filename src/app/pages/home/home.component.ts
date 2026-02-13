import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  menuItems = [
    { 
      path: '/citas', 
      icon: 'fas fa-calendar-check', 
      label: 'Citas',
      description: 'Agenda tu cita con nuestros barberos profesionales',
      color: 'primary'
    },
    { 
      path: '/compra-aqui', 
      icon: 'fas fa-shopping-bag', 
      label: 'Compra Aquí',
      description: 'Explora nuestro catálogo de productos',
      color: 'success'
    },
    { 
      path: '/acerca-de-nosotros', 
      icon: 'fas fa-info-circle', 
      label: 'Acerca de Nosotros',
      description: 'Conoce nuestra historia y valores',
      color: 'info'
    },
    { 
      path: '/academia', 
      icon: 'fas fa-graduation-cap', 
      label: 'Academia',
      description: 'Aprende con nosotros',
      color: 'warning'
    },
    { 
      path: 'https://www.facebook.com/share/1XmXmG651q/?mibextid=wwXIfr', 
      icon: 'fab fa-facebook', 
      label: 'Facebook',
      description: 'Síguenos en Facebook',
      color: 'primary',
      external: true
    },
    { 
      path: 'https://www.tiktok.com/@papusbarbershopgt?is_from_webapp=1&sender_device=pc', 
      icon: 'fab fa-tiktok', 
      label: 'TikTok',
      description: 'Síguenos en TikTok',
      color: 'dark',
      external: true
    }
  ];
}

