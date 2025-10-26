export class Perfil {
  constructor(
    public usuario: string,
    public tipo: 'admin' | 'chef',
    public pwd: string,
    public nombre: string | null,
    public telefono: string | null,
    public correo: string | null,
    public especialidad: string | null
  ) {}

  esChef(): boolean {
    return this.tipo === 'chef';
  }

  esAdmin(): boolean {
    return this.tipo === 'admin';
  }
}
