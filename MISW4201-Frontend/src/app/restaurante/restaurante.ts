export class Restaurante {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario_atencion: string;
  tipo_comida: string;
  foto: string;

  constructor(
    id: string,
    nombre: string,
    direccion: string,
    telefono: string,
    horario_atencion: string,
    tipo_comida: string,
    foto: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.telefono = telefono;
    this.horario_atencion = horario_atencion;
    this.tipo_comida = tipo_comida;
    this.foto = foto
  }
}
