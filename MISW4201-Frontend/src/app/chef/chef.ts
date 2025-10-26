export class Chef {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  especialidad: string;

  public constructor(id: number, nombre: string, telefono: string, correo: string, especialidad: string) {
    this.id = id;
    this.nombre = nombre;
    this.telefono = telefono || '';
    this.correo = correo || '';
    this.especialidad = especialidad || '';
  }
}
