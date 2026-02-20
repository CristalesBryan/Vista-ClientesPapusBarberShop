import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { TipoCorteService } from '../../services/tipo-corte.service';
import { BarberoService } from '../../services/barbero.service';
import { Cita, CitaCreate, Disponibilidad } from '../../models/cita.model';
import { TipoCorteAPI } from '../../models/tipo-corte-api.model';
import { Barbero } from '../../models/barbero.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  tiposCorte: TipoCorteAPI[] = [];
  barberos: Barbero[] = [];
  disponibilidades: Disponibilidad[] = [];
  
  tipoCorteSeleccionado: TipoCorteAPI | null = null;
  fechaSeleccionada: string = '';
  barberoSeleccionado: number = 0;
  horaSeleccionada: string = '';
  horaSeleccionada12h: string = '';
  
  horasDisponibles12h: string[] = [];
  horasDisponiblesBarbero: string[] = [];
  
  nuevaCita: CitaCreate = {
    fecha: '',
    hora: '',
    barberoId: 0,
    tipoCorteId: 0,
    nombreCliente: '',
    correoCliente: '',
    telefonoCliente: '',
    comentarios: '',
    correosConfirmacion: ['']
  };
  
  mostrarFormulario = false;
  cargando = false;
  editando = false;

  mostrarModalCambiarHoraFlag = false;
  citaCambiarHora: Cita | null = null;
  nuevaHoraSeleccionada: string = '';
  horasDisponiblesCambiar: string[] = [];

  mostrarModalDetallesCita = false;
  citaSeleccionada: Cita | null = null;
  editandoCita = false;
  
  mostrarModalConfirmacion = false;
  confirmacionTitulo = '';
  confirmacionMensaje = '';
  confirmacionAccion: (() => void) | null = null;
  confirmacionTipo: 'success' | 'warning' | 'danger' | 'info' = 'warning';
  citaEditando: CitaCreate = {
    fecha: '',
    hora: '',
    barberoId: 0,
    tipoCorteId: 0,
    nombreCliente: '',
    correoCliente: '',
    telefonoCliente: '',
    comentarios: '',
    correosConfirmacion: ['']
  };

  mostrarModalNotificacion = false;
  mensajeNotificacion = '';
  tipoNotificacion: 'success' | 'error' | 'info' | 'warning' = 'info';

  mostrarModalCitasDia = false;
  citasModalDia: Cita[] = [];
  fechaModalDia: Date | null = null;
  barberoModalDia: Barbero | null = null;

  fechaActual: Date = new Date();
  semanaActual: Date[] = [];
  fechaInicioSemana: Date = new Date();
  fechaSeleccionadaCalendario: Date = new Date();
  nombresDias: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /** Zona horaria del usuario (ej. America/Guatemala) para validaciones en el backend. */
  private getTimezoneUsuario(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Guatemala';
    } catch {
      return 'America/Guatemala';
    }
  }

  constructor(
    private citaService: CitaService,
    private tipoCorteService: TipoCorteService,
    private barberoService: BarberoService,
    private cdr: ChangeDetectorRef
  ) {
    this.generarHorasDisponibles12h();
  }

  ngOnInit(): void {
    // No cargar citas existentes en la vista de clientes
    // this.cargarCitas();
    this.cargarTiposCorte();
    this.cargarBarberos();
    this.establecerFechaHoy();
    this.inicializarSemana();
    
    window.addEventListener('barberosActualizados', () => {
      this.cargarBarberos();
    });
    
    window.addEventListener('tiposCorteActualizados', () => {
      this.cargarTiposCorte();
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (this.mostrarModalCitasDia) {
          this.cerrarModalCitasDia();
        } else if (this.mostrarModalConfirmacion) {
          this.cerrarModalConfirmacion();
        } else if (this.mostrarModalDetallesCita) {
          this.cerrarModalDetallesCita();
        } else if (this.mostrarModalCambiarHoraFlag) {
          this.cerrarModalCambiarHora();
        } else if (this.mostrarModalNotificacion) {
          this.cerrarModalNotificacion();
        }
      }
    });

    this.cerrarModalCitasDia();
  }

  inicializarSemana(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.fechaSeleccionadaCalendario = hoy;
    this.generarSemana();
  }

  generarSemana(): void {
    this.semanaActual = [];
    
    const lunes = new Date(this.fechaSeleccionadaCalendario);
    const dia = lunes.getDay();
    const diff = lunes.getDate() - dia + (dia === 0 ? -6 : 1);
    lunes.setDate(diff);
    lunes.setHours(0, 0, 0, 0);
    
    this.fechaInicioSemana = lunes;
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(lunes);
      fecha.setDate(fecha.getDate() + i);
      fecha.setHours(0, 0, 0, 0);
      this.semanaActual.push(fecha);
    }
  }

  diaAnterior(): void {
    const nuevaFecha = new Date(this.fechaSeleccionadaCalendario);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    nuevaFecha.setHours(0, 0, 0, 0);
    this.fechaSeleccionadaCalendario = nuevaFecha;
    this.generarSemana();
  }

  diaSiguiente(): void {
    const nuevaFecha = new Date(this.fechaSeleccionadaCalendario);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    nuevaFecha.setHours(0, 0, 0, 0);
    this.fechaSeleccionadaCalendario = nuevaFecha;
    this.generarSemana();
  }

  irAHoy(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.fechaSeleccionadaCalendario = hoy;
    this.generarSemana();
  }

  getRangoSemana(): string {
    if (this.semanaActual.length === 0) return '';
    const primerDia = this.semanaActual[0];
    const ultimoDia = this.semanaActual[6];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    if (primerDia.getMonth() === ultimoDia.getMonth()) {
      return `${primerDia.getDate()} - ${ultimoDia.getDate()} de ${meses[primerDia.getMonth()]} ${primerDia.getFullYear()}`;
    } else {
      return `${primerDia.getDate()} de ${meses[primerDia.getMonth()]} - ${ultimoDia.getDate()} de ${meses[ultimoDia.getMonth()]} ${primerDia.getFullYear()}`;
    }
  }

  getDiaSemanaAbrev(fecha: Date): string {
    return this.nombresDias[fecha.getDay()];
  }

  getDiaNumero(fecha: Date): number {
    return fecha.getDate();
  }

  getMesNombre(fecha: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[fecha.getMonth()];
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha.getTime() === hoy.getTime();
  }

  esFechaSeleccionada(fecha: Date): boolean {
    return fecha.getTime() === this.fechaSeleccionadaCalendario.getTime();
  }

  getCitasPorFechaYBarbero(fecha: Date, barberoId: number): Cita[] {
    const fechaStr = this.formatearFecha(fecha);
    return this.citas.filter(cita => {
      const citaFecha = cita.fecha.split('T')[0];
      return citaFecha === fechaStr && cita.barberoId === barberoId;
    });
  }

  getCitasVisibles(fecha: Date, barberoId: number): Cita[] {
    // En la vista de clientes, no mostrar citas existentes
    return [];
  }

  getCitasAdicionales(fecha: Date, barberoId: number): number {
    // En la vista de clientes, no mostrar indicador de citas adicionales
    return 0;
  }

  abrirModalCitasDia(fecha: Date, barberoId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const barbero = this.barberos.find(b => b.id === barberoId);
    this.citasModalDia = this.getCitasPorFechaYBarbero(fecha, barberoId)
      .sort((a, b) => a.hora.localeCompare(b.hora));
    this.fechaModalDia = fecha;
    this.barberoModalDia = barbero || null;
    this.mostrarModalCitasDia = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalCitasDia(): void {
    this.mostrarModalCitasDia = false;
    this.citasModalDia = [];
    this.fechaModalDia = null;
    this.barberoModalDia = null;
    document.body.style.overflow = '';
  }

  formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  abrirFormularioConFecha(fecha: Date, barberoId?: number): void {
    const fechaStr = this.formatearFecha(fecha);
    this.fechaSeleccionada = fechaStr;
    this.nuevaCita.fecha = fechaStr;
    this.fechaSeleccionadaCalendario = fecha;
    this.generarSemana();
    
    if (barberoId) {
      this.barberoSeleccionado = barberoId;
      this.nuevaCita.barberoId = barberoId;
      this.asignarCorreoBarberoACorreosConfirmacion(barberoId);
    }
    
    this.cargarDisponibilidad();
    this.mostrarFormulario = true;
  }

  /**
   * Asigna el correo del barbero a correosConfirmacion (para envío de confirmación).
   * En Vista-Clientes no se muestra este campo; se usa automáticamente al seleccionar barbero.
   */
  private asignarCorreoBarberoACorreosConfirmacion(barberoId: number): void {
    const barbero = this.barberos.find(b => b.id === barberoId);
    if (!barbero?.correo || barbero.correo.trim() === '') return;
    this.nuevaCita.correosConfirmacion = this.nuevaCita.correosConfirmacion
      .filter(c => c && c.trim() !== '')
      .filter(c => c !== barbero.correo);
    this.nuevaCita.correosConfirmacion.unshift(barbero.correo.trim());
    if (this.nuevaCita.correosConfirmacion.length === 1) {
      this.nuevaCita.correosConfirmacion.push('');
    }
  }

  convertirHoraA12h(hora24: string): string {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    const h = parseInt(horas, 10);
    const m = minutos || '00';
    const periodo = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${m} ${periodo}`;
  }

  establecerFechaHoy(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaStr = `${año}-${mes}-${dia}`;
    this.fechaSeleccionada = fechaStr;
    this.nuevaCita.fecha = fechaStr;
    this.cargarDisponibilidad();
  }

  cargarCitas(noCambiarCargando: boolean = false): void {
    if (!noCambiarCargando) {
      this.cargando = true;
    }
    this.citaService.obtenerTodas().subscribe({
      next: (data) => {
        this.citas = [...data];
        this.generarSemana();
        this.cdr.detectChanges();
        if (!noCambiarCargando) {
          this.cargando = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        if (!noCambiarCargando) {
          this.cargando = false;
        }
      }
    });
  }

  cargarTiposCorte(): void {
    this.tipoCorteService.obtenerTodosActivos().subscribe({
      next: (data) => {
        console.log('Tipos de corte cargados:', data);
        this.tiposCorte = data;
        if (data.length === 0) {
          console.warn('No hay tipos de corte activos en la base de datos');
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos de corte:', error);
        this.mostrarNotificacion('Error al cargar los tipos de corte. Por favor, verifique la conexión con el servidor.', 'error');
      }
    });
  }

  cargarBarberos(): void {
    this.barberoService.getAll().subscribe({
      next: (data) => {
        this.barberos = data;
      },
      error: (error) => {
        console.error('Error al cargar barberos:', error);
      }
    });
  }

  cargarDisponibilidad(): void {
    if (!this.fechaSeleccionada) return;
    
    this.disponibilidades = [];
    
    this.citaService.obtenerDisponibilidad(this.fechaSeleccionada, this.getTimezoneUsuario()).subscribe({
      next: (data) => {
        console.log('Disponibilidades cargadas:', data);
        
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);
        const fechaSeleccionadaDate = new Date(this.fechaSeleccionada);
        fechaSeleccionadaDate.setHours(0, 0, 0, 0);
        
        this.disponibilidades = data.filter(d => {
          const tieneHorasDisponibles = d.horasDisponibles && d.horasDisponibles.length > 0;
          if (!tieneHorasDisponibles) {
            console.log(`Excluyendo barbero ${d.barberoNombre} - no tiene horas disponibles`);
            return false;
          }
          return true;
        });
        
        console.log(`Barberos disponibles después del filtrado: ${this.disponibilidades.length}`);
        
        this.actualizarHorasDisponibles();
        
        if (this.barberoSeleccionado > 0) {
          const barberoDisponible = this.disponibilidades.find(d => d.barberoId === this.barberoSeleccionado);
          if (!barberoDisponible) {
            console.log(`El barbero seleccionado (ID: ${this.barberoSeleccionado}) ya no está disponible, limpiando selección`);
            this.barberoSeleccionado = 0;
            this.nuevaCita.barberoId = 0;
            this.horaSeleccionada = '';
            this.horaSeleccionada12h = '';
          }
        }
        
        this.cdr.detectChanges();
        
        this.disponibilidades.forEach(d => {
          console.log(`Barbero ${d.barberoNombre} (ID: ${d.barberoId}):`, {
            horaEntrada: d.horaEntrada,
            horaSalida: d.horaSalida,
            horasDisponibles: d.horasDisponibles?.length || 0,
            horasOcupadas: d.horasOcupadas?.length || 0
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad:', error);
      }
    });
  }

  onTipoCorteSeleccionado(): void {
    const tipoCorteId = typeof this.nuevaCita.tipoCorteId === 'string' 
      ? parseInt(this.nuevaCita.tipoCorteId as any, 10) 
      : this.nuevaCita.tipoCorteId;
    
    if (tipoCorteId === 0 || tipoCorteId === null) {
      this.tipoCorteSeleccionado = null;
      this.barberoSeleccionado = 0;
      this.horaSeleccionada = '';
      this.horaSeleccionada12h = '';
      return;
    }
    
    const tipoCorte = this.tiposCorte.find(tc => tc.id === tipoCorteId);
    if (tipoCorte) {
      this.tipoCorteSeleccionado = tipoCorte;
      this.nuevaCita.tipoCorteId = tipoCorte.id;
      
      if (tipoCorte.barberoId && tipoCorte.barberoId > 0) {
        this.barberoSeleccionado = tipoCorte.barberoId;
        this.nuevaCita.barberoId = tipoCorte.barberoId;
        this.onBarberoSeleccionado();
      } else {
        this.barberoSeleccionado = 0;
        this.nuevaCita.barberoId = 0;
      }
      
      if (this.fechaSeleccionada) {
        this.cargarCitas();
        this.cargarDisponibilidad();
        this.actualizarHorasDisponibles();
      }
    } else {
      this.tipoCorteSeleccionado = null;
    }
  }

  tieneBarberoAsignado(): boolean {
    return !!(this.tipoCorteSeleccionado && this.tipoCorteSeleccionado.barberoId && this.tipoCorteSeleccionado.barberoId > 0);
  }

  getTiposCorteDisponibles(): TipoCorteAPI[] {
    if (this.tieneBarberoAsignado()) {
      return this.tiposCorte;
    }
    
    if (!this.barberoSeleccionado || this.barberoSeleccionado === 0) {
      return this.tiposCorte;
    }
    
    return this.tiposCorte.filter(tc => 
      !tc.barberoId || tc.barberoId === 0 || tc.barberoId === this.barberoSeleccionado
    );
  }

  onFechaCambiada(): void {
    this.barberoSeleccionado = 0;
    this.nuevaCita.barberoId = 0;
    this.horaSeleccionada = '';
    this.horaSeleccionada12h = '';
    this.horasDisponiblesBarbero = [];
    this.disponibilidades = [];
    
    if (this.fechaSeleccionada) {
      this.nuevaCita.fecha = this.fechaSeleccionada;
      this.cargarCitas();
      this.cargarDisponibilidad();
    }
  }

  onBarberoSeleccionado(): void {
    if (this.tieneBarberoAsignado()) {
      if (this.tipoCorteSeleccionado && this.tipoCorteSeleccionado.barberoId) {
        this.barberoSeleccionado = this.tipoCorteSeleccionado.barberoId;
        this.nuevaCita.barberoId = this.tipoCorteSeleccionado.barberoId;
      }
      return;
    }
    
    const barberoId = typeof this.barberoSeleccionado === 'string' 
      ? parseInt(this.barberoSeleccionado as any, 10) 
      : this.barberoSeleccionado;
    
    this.barberoSeleccionado = barberoId;
    this.nuevaCita.barberoId = barberoId;
    this.horaSeleccionada = '';
    this.horaSeleccionada12h = '';
    this.nuevaCita.hora = '';
    
    if (this.tipoCorteSeleccionado && this.tipoCorteSeleccionado.barberoId && 
        this.tipoCorteSeleccionado.barberoId > 0 && 
        this.tipoCorteSeleccionado.barberoId !== barberoId) {
      this.nuevaCita.tipoCorteId = 0;
      this.tipoCorteSeleccionado = null;
    }
    
    this.asignarCorreoBarberoACorreosConfirmacion(barberoId);
    
    if (this.fechaSeleccionada) {
      this.cargarDisponibilidad();
      this.actualizarHorasDisponibles();
    }
  }
  
  actualizarHorasDisponibles(): void {
    if (this.barberoSeleccionado > 0) {
      this.horasDisponiblesBarbero = [];
      const horasNuevas = this.getHorasDisponibles(this.barberoSeleccionado);
      this.horasDisponiblesBarbero = [...horasNuevas];
      console.log('Horas disponibles actualizadas:', this.horasDisponiblesBarbero.length, 'horas');
    } else {
      this.horasDisponiblesBarbero = [];
    }
  }

  trackByHora(index: number, hora: string): string {
    return hora;
  }

  convertirTiempoALegible(minutos: number): string {
    if (!minutos || minutos < 0) return '0min';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins}min`;
    }
  }

  getBarberosDisponibles(): Barbero[] {
    if (!this.fechaSeleccionada || this.disponibilidades.length === 0) {
      return [];
    }
    
    const barberosDisponiblesIds = this.disponibilidades
      .filter(d => d.horasDisponibles && d.horasDisponibles.length > 0)
      .map(d => d.barberoId);
    
    const barberosFiltrados = this.barberos.filter(b => barberosDisponiblesIds.includes(b.id));
    
    console.log(`Barberos disponibles: ${barberosFiltrados.length} de ${this.barberos.length} totales`);
    
    return barberosFiltrados;
  }

  generarHorasDisponibles12h(): void {
    this.horasDisponibles12h = [];
    const minutos = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    
    for (let hora = 6; hora <= 11; hora++) {
      for (const minuto of minutos) {
        this.horasDisponibles12h.push(`${hora.toString().padStart(2, '0')}:${minuto} AM`);
      }
    }
    
    for (const minuto of minutos) {
      this.horasDisponibles12h.push(`12:${minuto} PM`);
    }
    
    for (let hora = 1; hora <= 11; hora++) {
      for (const minuto of minutos) {
        this.horasDisponibles12h.push(`${hora.toString().padStart(2, '0')}:${minuto} PM`);
      }
    }
    
    for (const minuto of minutos) {
      this.horasDisponibles12h.push(`12:${minuto} AM`);
    }
  }

  convertir12hA24h(hora12h: string): string {
    if (!hora12h) return '';
    
    const partes = hora12h.trim().split(' ');
    if (partes.length !== 2) return '';
    
    const [horaMin, periodo] = partes;
    const [hora, minuto] = horaMin.split(':');
    let hora24 = parseInt(hora, 10);
    
    if (periodo === 'AM') {
      if (hora24 === 12) {
        hora24 = 0;
      }
    } else if (periodo === 'PM') {
      if (hora24 !== 12) {
        hora24 += 12;
      }
    }
    
    return `${hora24.toString().padStart(2, '0')}:${minuto || '00'}`;
  }

  convertir24hA12h(hora24h: string): string {
    if (!hora24h) return '';
    
    const [hora, minuto] = hora24h.split(':');
    let hora12 = parseInt(hora, 10);
    const min = minuto || '00';
    let periodo = 'AM';
    
    if (hora12 === 0) {
      hora12 = 12;
      periodo = 'AM';
    } else if (hora12 === 12) {
      periodo = 'PM';
    } else if (hora12 > 12) {
      hora12 -= 12;
      periodo = 'PM';
    } else {
      periodo = 'AM';
    }
    
    return `${hora12.toString().padStart(2, '0')}:${min} ${periodo}`;
  }

  onHoraSeleccionada(): void {
    const hora24h = this.convertir12hA24h(this.horaSeleccionada12h);
    if (this.editandoCita && this.citaEditando) {
      this.citaEditando.hora = hora24h;
    } else {
      this.nuevaCita.hora = hora24h;
    }
    this.horaSeleccionada = hora24h;
  }

  getHorasDisponibles(barberoId: number): string[] {
    if (!barberoId || barberoId === 0) {
      return [];
    }
    
    const disponibilidad = this.disponibilidades.find(d => d.barberoId === barberoId);
    if (!disponibilidad || !disponibilidad.horaEntrada || !disponibilidad.horaSalida) {
      console.log('No se encontró disponibilidad para el barbero:', barberoId);
      return [];
    }
    
    const [horaEntradaStr, minutoEntradaStr] = disponibilidad.horaEntrada.split(':');
    const [horaSalidaStr, minutoSalidaStr] = disponibilidad.horaSalida.split(':');
    const horaEntradaNum = parseInt(horaEntradaStr, 10);
    const minutoEntradaNum = parseInt(minutoEntradaStr, 10);
    const horaSalidaNum = parseInt(horaSalidaStr, 10);
    const minutoSalidaNum = parseInt(minutoSalidaStr, 10);
    
    let inicioMinutos = horaEntradaNum * 60 + minutoEntradaNum;
    let finMinutos = horaSalidaNum * 60 + minutoSalidaNum;
    
    if (horaSalidaNum === 0 && minutoSalidaNum === 0) {
      finMinutos = 24 * 60;
    }
    
    const citasActivas = this.citas.filter(c => 
      c.barberoId === barberoId && 
      c.fecha === this.fechaSeleccionada &&
      c.estado !== 'CANCELADA' && 
      c.estado !== 'COMPLETADA' &&
      (!this.citaSeleccionada || c.id !== this.citaSeleccionada.id)
    );
    
    const rangosOcupados: Array<{ inicio: number, fin: number }> = [];
    for (const cita of citasActivas) {
      const [horaStr, minutoStr] = cita.hora.split(':');
      const horaInicio = parseInt(horaStr, 10);
      const minutoInicio = parseInt(minutoStr, 10);
      const inicioCitaMinutos = horaInicio * 60 + minutoInicio;
      const finCitaMinutos = inicioCitaMinutos + cita.tipoCorteTiempoMinutos;
      rangosOcupados.push({ inicio: inicioCitaMinutos, fin: finCitaMinutos });
    }
    
    const horasDisponibles12h: string[] = [];
    const horasAgregadas = new Set<string>();
    
    console.log(`Barbero ${barberoId} - Horas disponibles del backend:`, disponibilidad.horasDisponibles?.length || 0);
    
    if (disponibilidad.horasDisponibles && disponibilidad.horasDisponibles.length > 0) {
      console.log(`✓ Usando ${disponibilidad.horasDisponibles.length} horas del backend`);
      for (const hora24h of disponibilidad.horasDisponibles) {
        let horaStr: string;
        if (typeof hora24h === 'string') {
          const partes = hora24h.split(':');
          horaStr = `${partes[0]}:${partes[1]}`;
        } else if (hora24h && typeof hora24h === 'object') {
          const hour = (hora24h as any).hour || (hora24h as any)[0] || 0;
          const minute = (hora24h as any).minute || (hora24h as any)[1] || 0;
          horaStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        } else {
          console.warn(`Formato de hora desconocido:`, hora24h);
          continue;
        }
        
        const [horaStr2, minutoStr] = horaStr.split(':');
        const horaNum = parseInt(horaStr2, 10);
        const minutoNum = parseInt(minutoStr, 10);
        
        if (isNaN(horaNum) || isNaN(minutoNum)) {
          console.warn(`No se pudo parsear la hora: ${horaStr}`);
          continue;
        }
        
        const horaMinutos = horaNum * 60 + minutoNum;
        
        let haySolapamiento = false;
        for (const rango of rangosOcupados) {
          if (horaMinutos >= rango.inicio && horaMinutos < rango.fin) {
            haySolapamiento = true;
            break;
          }
        }
        
        if (!haySolapamiento) {
          const hora12h = this.convertir24hA12h(horaStr);
          if (!horasAgregadas.has(hora12h)) {
            horasDisponibles12h.push(hora12h);
            horasAgregadas.add(hora12h);
          }
        }
      }
      console.log(`✓ Horas procesadas del backend: ${horasDisponibles12h.length}`);
    } else {
      console.warn(`✗ Backend no tiene horas, usando fallback`);
      let horaActualMinutos = inicioMinutos;
      while (horaActualMinutos < finMinutos) {
        let haySolapamiento = false;
        for (const rango of rangosOcupados) {
          if (horaActualMinutos >= rango.inicio && horaActualMinutos < rango.fin) {
            haySolapamiento = true;
            break;
          }
        }
        
        if (!haySolapamiento) {
          const horas = Math.floor(horaActualMinutos / 60);
          const minutos = horaActualMinutos % 60;
          const hora24h = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
          const hora12h = this.convertir24hA12h(hora24h);
          
          if (!horasAgregadas.has(hora12h)) {
            horasDisponibles12h.push(hora12h);
            horasAgregadas.add(hora12h);
          }
        }
        
        horaActualMinutos += 5;
      }
    }
    
    horasDisponibles12h.sort((a, b) => {
      const horaA = this.convertir12hA24h(a);
      const horaB = this.convertir12hA24h(b);
      return horaA.localeCompare(horaB);
    });
    
    const horasUnicas = Array.from(new Set(horasDisponibles12h));
    
    console.log(`Horas disponibles generadas: ${horasUnicas.length}`);
    
    return horasUnicas;
  }

  tieneHorario(barberoId: number): boolean {
    return this.disponibilidades.some(d => d.barberoId === barberoId);
  }

  agregarCorreo(): void {
    if (this.editandoCita && this.citaEditando) {
      this.citaEditando.correosConfirmacion.push('');
    } else {
      this.nuevaCita.correosConfirmacion.push('');
    }
  }

  eliminarCorreo(index: number): void {
    if (this.editandoCita && this.citaEditando) {
      if (this.citaEditando.correosConfirmacion.length > 1) {
        this.citaEditando.correosConfirmacion.splice(index, 1);
      }
    } else {
      if (this.nuevaCita.correosConfirmacion.length > 1) {
        this.nuevaCita.correosConfirmacion.splice(index, 1);
      }
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) {
      if (this.tiposCorte.length === 0) {
        this.cargarTiposCorte();
      }
    } else {
      this.resetearFormulario();
    }
  }

  resetearFormulario(): void {
    this.nuevaCita = {
      fecha: this.fechaSeleccionada,
      hora: '',
      barberoId: 0,
      tipoCorteId: 0,
      nombreCliente: '',
      correoCliente: '',
      telefonoCliente: '',
      comentarios: '',
      correosConfirmacion: ['']
    };
    this.tipoCorteSeleccionado = null;
    this.barberoSeleccionado = 0;
    this.horaSeleccionada = '';
    this.horaSeleccionada12h = '';
    this.editando = false;
  }

  guardarCita(): void {
    let correosValidos = this.nuevaCita.correosConfirmacion.filter(c => c && c.trim() !== '');
    // En Vista-Clientes el correo del barbero se asigna automáticamente al seleccionarlo (no se muestra en la vista)
    if (this.barberoSeleccionado > 0) {
      const barbero = this.barberos.find(b => b.id === this.barberoSeleccionado);
      if (barbero?.correo && barbero.correo.trim() !== '' && !correosValidos.includes(barbero.correo.trim())) {
        correosValidos = [barbero.correo.trim(), ...correosValidos];
      }
    }
    if (correosValidos.length === 0) {
      this.mostrarNotificacion('Debe proporcionar al menos un correo para la confirmación', 'warning');
      return;
    }

    if (this.nuevaCita.correoCliente?.trim() && !correosValidos.includes(this.nuevaCita.correoCliente.trim())) {
      correosValidos.push(this.nuevaCita.correoCliente.trim());
    }

    if (this.tipoCorteSeleccionado && this.barberoSeleccionado > 0 && this.nuevaCita.hora) {
      const disponibilidad = this.disponibilidades.find(d => d.barberoId === this.barberoSeleccionado);
      if (disponibilidad) {
        const [horaSalidaStr, minutoSalidaStr] = disponibilidad.horaSalida.split(':');
        const horaSalidaNum = parseInt(horaSalidaStr, 10);
        const minutoSalidaNum = parseInt(minutoSalidaStr, 10);
        let finMinutos = horaSalidaNum * 60 + minutoSalidaNum;
        
        if (horaSalidaNum === 0 && minutoSalidaNum === 0) {
          finMinutos = 24 * 60;
        }
        
        const [horaStr, minutoStr] = this.nuevaCita.hora.split(':');
        const horaInicio = parseInt(horaStr, 10);
        const minutoInicio = parseInt(minutoStr, 10);
        const inicioMinutos = horaInicio * 60 + minutoInicio;
        const finCorteMinutos = inicioMinutos + this.tipoCorteSeleccionado.tiempoMinutos;
        
        if (finCorteMinutos > finMinutos) {
          const horaSalida12h = this.convertir24hA12h(disponibilidad.horaSalida);
          const tiempoLegible = this.convertirTiempoALegible(this.tipoCorteSeleccionado.tiempoMinutos);
          this.mostrarNotificacion(`El corte seleccionado (${tiempoLegible}) no cabe en el horario del barbero. El horario termina a las ${horaSalida12h}.`, 'error');
          this.cargando = false;
          return;
        }
      }
    }

    const citaParaGuardar: CitaCreate = {
      ...this.nuevaCita,
      correosConfirmacion: correosValidos,
      timezone: this.getTimezoneUsuario()
    };

    this.cargando = true;
    this.citaService.crearCita(citaParaGuardar).subscribe({
      next: () => {
        this.mostrarNotificacion('Cita creada exitosamente. Se ha enviado un correo de confirmación.', 'success');
        this.cargarCitas();
        setTimeout(() => {
          this.cargarDisponibilidad();
          this.barberoSeleccionado = 0;
          this.horaSeleccionada = '';
          this.horaSeleccionada12h = '';
          this.toggleFormulario();
          this.cargando = false;
        }, 300);
      },
      error: (error) => {
        console.error('Error al crear cita:', error);
        let mensaje = 'Error al crear la cita';
        
        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.status === 500 || error.status === 409) {
          if (error.error?.message && error.error.message.includes('duplicate') || 
              error.error?.message && error.error.message.includes('duplicada')) {
            mensaje = 'Ya existe una cita para este barbero en la fecha y hora seleccionada. Por favor, seleccione otra hora.';
          } else {
            mensaje = 'Ya existe una cita para este barbero en la fecha y hora seleccionada. Por favor, seleccione otra hora.';
          }
        }
        
        this.mostrarNotificacion(mensaje, 'error');
        this.cargarCitas();
        this.cargarDisponibilidad();
        this.barberoSeleccionado = 0;
        this.horaSeleccionada = '';
        this.horaSeleccionada12h = '';
        this.nuevaCita.hora = '';
        this.cargando = false;
      }
    });
  }

  cancelarCita(id: number): void {
    const cita = this.citas.find(c => c.id === id);
    const nombreCliente = cita?.nombreCliente || 'esta cita';
    const fecha = cita?.fecha || '';
    const hora = cita?.hora || '';
    
    this.mostrarConfirmacion(
      'Cancelar Cita',
      `¿Está seguro de cancelar la cita de <strong>${nombreCliente}</strong> programada para el <strong>${fecha}</strong> a las <strong>${hora}</strong>?`,
      'warning',
      () => {
        this.ejecutarCancelacionCita(id);
      }
    );
  }
  
  ejecutarCancelacionCita(id: number): void {
    this.cargando = true;
    
    if (this.mostrarModalDetallesCita && this.citaSeleccionada?.id === id) {
      this.cerrarModalDetallesCita();
    }
    
    this.citaService.cancelarCita(id).subscribe({
        next: () => {
          console.log('Cita cancelada exitosamente');
          
          this.cargarCitas();
          this.generarSemana();
          
          if (this.fechaSeleccionada) {
            setTimeout(() => {
              console.log('Recargando disponibilidad después de cancelar cita...');
              this.cargarDisponibilidad();
              
              if (this.barberoSeleccionado > 0) {
                setTimeout(() => {
                  this.actualizarHorasDisponibles();
                  console.log('Horas disponibles actualizadas después de cancelar cita');
                }, 300);
              }
            }, 400);
          }
          
          this.cargando = false;
          this.mostrarNotificacion('Cita cancelada exitosamente. La hora ahora está disponible.', 'success');
        },
        error: (error) => {
          console.error('Error al cancelar cita:', error);
          const mensaje = error.error?.message || 'Error al cancelar la cita';
          this.mostrarNotificacion(mensaje, 'error');
          this.cargando = false;
        }
      });
  }

  completarCita(id: number): void {
    const cita = this.citas.find(c => c.id === id);
    const nombreCliente = cita?.nombreCliente || 'el cliente';
    const barberoNombre = cita?.barberoNombre || 'el barbero';
    const fecha = cita?.fecha || '';
    const hora = cita?.hora || '';
    
    this.mostrarConfirmacion(
      'Completar Cita',
      `¿Está seguro de marcar como completada la cita de <strong>${nombreCliente}</strong> con <strong>${barberoNombre}</strong> programada para el <strong>${fecha}</strong> a las <strong>${hora}</strong>?<br><br><small class="text-muted">El barbero habrá terminado el corte y la hora quedará disponible para nuevas citas.</small>`,
      'success',
      () => {
        this.ejecutarCompletarCita(id);
      }
    );
  }
  
  ejecutarCompletarCita(id: number): void {
    this.cargando = true;
    
    if (this.mostrarModalDetallesCita && this.citaSeleccionada?.id === id) {
      this.cerrarModalDetallesCita();
    }
    
    this.citaService.completarCita(id).subscribe({
        next: (citaActualizada) => {
          console.log('Cita completada exitosamente:', citaActualizada);
          
          this.cargarCitas(true);
          
          if (this.fechaSeleccionada) {
            setTimeout(() => {
              console.log('Recargando disponibilidad después de completar cita...');
              this.cargarDisponibilidad();
              
              if (this.barberoSeleccionado > 0) {
                setTimeout(() => {
                  this.actualizarHorasDisponibles();
                  console.log('Horas disponibles actualizadas después de completar cita');
                }, 200);
              }
              
              setTimeout(() => {
                this.cargando = false;
                this.cdr.detectChanges();
                this.mostrarNotificacion('Cita marcada como completada. Las horas ahora están disponibles.', 'success');
              }, 300);
            }, 400);
          } else {
            this.cargando = false;
            this.mostrarNotificacion('Cita marcada como completada exitosamente.', 'success');
          }
        },
        error: (error) => {
          console.error('Error al completar cita:', error);
          const mensaje = error.error?.message || 'Error al completar la cita';
          this.mostrarNotificacion(mensaje, 'error');
          this.cargando = false;
        }
      });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-success';
      case 'PENDIENTE':
        return 'bg-warning';
      case 'CANCELADA':
        return 'bg-danger';
      case 'COMPLETADA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  mostrarModalCambiarHora(cita: Cita): void {
    this.citaCambiarHora = cita;
    this.nuevaHoraSeleccionada = '';
    this.mostrarModalCambiarHoraFlag = true;
    
    this.cargarDisponibilidadParaCambiarHora(cita.fecha, cita.barberoId, cita.tipoCorteTiempoMinutos);
  }

  cargarDisponibilidadParaCambiarHora(fecha: string, barberoId: number, tiempoMinutos: number): void {
    this.citaService.obtenerDisponibilidad(fecha, this.getTimezoneUsuario()).subscribe({
      next: (disponibilidades) => {
        const disponibilidad = disponibilidades.find(d => d.barberoId === barberoId);
        if (disponibilidad) {
          const citaIdActual = this.citaCambiarHora?.id;
          const citasActivas = this.citas.filter(c => 
            c.barberoId === barberoId && 
            c.fecha === fecha &&
            c.id !== citaIdActual &&
            c.estado !== 'CANCELADA' && 
            c.estado !== 'COMPLETADA'
          );
          
          const rangosOcupados: Array<{ inicio: number, fin: number }> = [];
          for (const cita of citasActivas) {
            const [horaStr, minutoStr] = cita.hora.split(':');
            const horaInicio = parseInt(horaStr, 10);
            const minutoInicio = parseInt(minutoStr, 10);
            const inicioMinutos = horaInicio * 60 + minutoInicio;
            
            const finMinutos = inicioMinutos + cita.tipoCorteTiempoMinutos;
            
            rangosOcupados.push({ inicio: inicioMinutos, fin: finMinutos });
          }
          
          this.horasDisponiblesCambiar = disponibilidad.horasDisponibles.filter(hora => {
            const [horaStr, minutoStr] = hora.split(':');
            const horaInicio = parseInt(horaStr, 10);
            const minutoInicio = parseInt(minutoStr, 10);
            const inicioMinutos = horaInicio * 60 + minutoInicio;
            
            const finMinutos = inicioMinutos + tiempoMinutos;
            
            const horaSalida = disponibilidad.horaSalida.split(':');
            const horaSalidaNum = parseInt(horaSalida[0], 10);
            const minutoSalidaNum = parseInt(horaSalida[1], 10);
            const totalMinutosSalida = horaSalidaNum * 60 + minutoSalidaNum;
            
            if (finMinutos > totalMinutosSalida) {
              return false;
            }
            
            for (const rango of rangosOcupados) {
              if ((inicioMinutos >= rango.inicio && inicioMinutos < rango.fin) ||
                  (finMinutos > rango.inicio && finMinutos <= rango.fin) ||
                  (inicioMinutos <= rango.inicio && finMinutos >= rango.fin)) {
                return false;
              }
            }
            
            return true;
          });
        } else {
          this.horasDisponiblesCambiar = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad:', error);
        this.horasDisponiblesCambiar = [];
      }
    });
  }

  cambiarHora(): void {
    if (!this.citaCambiarHora || !this.nuevaHoraSeleccionada) {
      this.mostrarNotificacion('Por favor, seleccione una hora', 'warning');
      return;
    }

    if (this.nuevaHoraSeleccionada === this.citaCambiarHora.hora) {
      this.mostrarNotificacion('La nueva hora debe ser diferente a la hora actual', 'warning');
      return;
    }

    this.cargando = true;
    this.citaService.actualizarHora(this.citaCambiarHora.id, this.nuevaHoraSeleccionada).subscribe({
      next: () => {
        this.cargarCitas();
        setTimeout(() => {
          if (this.fechaSeleccionada) {
            this.cargarDisponibilidad();
          }
          this.cargando = false;
          this.mostrarModalCambiarHoraFlag = false;
          this.citaCambiarHora = null;
          this.nuevaHoraSeleccionada = '';
          this.mostrarNotificacion('Hora de la cita actualizada exitosamente.', 'success');
        }, 500);
      },
      error: (error) => {
        console.error('Error al cambiar hora:', error);
        const mensaje = error.error?.message || 'Error al cambiar la hora de la cita';
        this.mostrarNotificacion(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  cerrarModalCambiarHora(): void {
    this.mostrarModalCambiarHoraFlag = false;
    this.citaCambiarHora = null;
    this.nuevaHoraSeleccionada = '';
    this.horasDisponiblesCambiar = [];
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.mensajeNotificacion = mensaje;
    this.tipoNotificacion = tipo;
    this.mostrarModalNotificacion = true;
  }

  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
    this.mensajeNotificacion = '';
  }

  abrirModalDetallesCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.editandoCita = false;
    this.mostrarModalDetallesCita = true;
  }

  cerrarModalDetallesCita(): void {
    this.mostrarModalDetallesCita = false;
    this.citaSeleccionada = null;
    this.editandoCita = false;
    this.citaEditando = {
      fecha: '',
      hora: '',
      barberoId: 0,
      tipoCorteId: 0,
      nombreCliente: '',
      correoCliente: '',
      telefonoCliente: '',
      comentarios: '',
      correosConfirmacion: ['']
    };
  }

  iniciarEdicionCita(): void {
    if (!this.citaSeleccionada) return;
    
    this.editandoCita = true;
    const barberoId = this.citaSeleccionada.barberoId;
    const correosIniciales = this.citaSeleccionada.correoCliente ? [this.citaSeleccionada.correoCliente] : [''];
    if (barberoId > 0) {
      const barbero = this.barberos.find(b => b.id === barberoId);
      if (barbero?.correo && barbero.correo.trim() !== '' && !correosIniciales.includes(barbero.correo.trim())) {
        correosIniciales.unshift(barbero.correo.trim());
      }
    }
    this.citaEditando = {
      fecha: this.citaSeleccionada.fecha.split('T')[0],
      hora: this.citaSeleccionada.hora,
      barberoId: this.citaSeleccionada.barberoId,
      tipoCorteId: this.citaSeleccionada.tipoCorteId,
      nombreCliente: this.citaSeleccionada.nombreCliente,
      correoCliente: this.citaSeleccionada.correoCliente,
      telefonoCliente: this.citaSeleccionada.telefonoCliente || '',
      comentarios: this.citaSeleccionada.comentarios || '',
      correosConfirmacion: correosIniciales.length > 0 ? correosIniciales : ['']
    };
    
    this.horaSeleccionada12h = this.convertirHoraA12h(this.citaSeleccionada.hora);
    this.fechaSeleccionada = this.citaSeleccionada.fecha.split('T')[0];
    this.barberoSeleccionado = this.citaSeleccionada.barberoId;
    
    this.cargarDisponibilidad();
    
    const tipoCorte = this.tiposCorte.find(tc => tc.id === this.citaSeleccionada!.tipoCorteId);
    if (tipoCorte) {
      this.tipoCorteSeleccionado = tipoCorte;
    }
  }

  cancelarEdicionCita(): void {
    this.editandoCita = false;
    this.citaEditando = {
      fecha: '',
      hora: '',
      barberoId: 0,
      tipoCorteId: 0,
      nombreCliente: '',
      correoCliente: '',
      telefonoCliente: '',
      comentarios: '',
      correosConfirmacion: ['']
    };
  }

  guardarEdicionCita(): void {
    if (!this.citaSeleccionada) return;

    let correosValidos = this.citaEditando.correosConfirmacion.filter(c => c && c.trim() !== '');
    const barberoId = this.citaEditando.barberoId || 0;
    if (barberoId > 0) {
      const barbero = this.barberos.find(b => b.id === barberoId);
      if (barbero?.correo && barbero.correo.trim() !== '' && !correosValidos.includes(barbero.correo.trim())) {
        correosValidos = [barbero.correo.trim(), ...correosValidos];
      }
    }
    if (correosValidos.length === 0) {
      this.mostrarNotificacion('Debe proporcionar al menos un correo para la confirmación', 'warning');
      return;
    }
    if (this.citaEditando.correoCliente?.trim() && !correosValidos.includes(this.citaEditando.correoCliente.trim())) {
      correosValidos.push(this.citaEditando.correoCliente.trim());
    }

    if (this.horaSeleccionada12h) {
      this.citaEditando.hora = this.convertir12hA24h(this.horaSeleccionada12h);
    }

    const citaParaActualizar: CitaCreate = { ...this.citaEditando, correosConfirmacion: correosValidos };
    this.cargando = true;
    this.citaService.update(this.citaSeleccionada.id, citaParaActualizar).subscribe({
      next: () => {
        this.cargarCitas();
        this.mostrarNotificacion('Cita actualizada exitosamente', 'success');
        this.editandoCita = false;
        this.cargando = false;
        setTimeout(() => {
          this.cargarCitas();
          if (this.citaSeleccionada) {
            const citaActualizada = this.citas.find(c => c.id === this.citaSeleccionada!.id);
            if (citaActualizada) {
              this.citaSeleccionada = citaActualizada;
            }
          }
        }, 500);
      },
      error: (error) => {
        console.error('Error al actualizar cita:', error);
        this.mostrarNotificacion(error.error?.message || 'Error al actualizar la cita', 'error');
        this.cargando = false;
      }
    });
  }

  finalizarCitaDesdeModal(): void {
    if (!this.citaSeleccionada) return;
    this.completarCita(this.citaSeleccionada.id);
  }

  cancelarCitaDesdeModal(): void {
    if (!this.citaSeleccionada) return;
    this.cancelarCita(this.citaSeleccionada.id);
  }

  mostrarConfirmacion(titulo: string, mensaje: string, tipo: 'success' | 'warning' | 'danger' | 'info', accion: () => void): void {
    this.confirmacionTitulo = titulo;
    this.confirmacionMensaje = mensaje;
    this.confirmacionTipo = tipo;
    this.confirmacionAccion = accion;
    this.mostrarModalConfirmacion = true;
    document.body.style.overflow = 'hidden';
  }

  confirmarAccion(): void {
    if (this.confirmacionAccion) {
      this.confirmacionAccion();
    }
    this.cerrarModalConfirmacion();
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.confirmacionTitulo = '';
    this.confirmacionMensaje = '';
    this.confirmacionAccion = null;
    document.body.style.overflow = '';
  }
}

