import json
import hashlib
from unittest import TestCase

from faker import Faker
from modelos import db, Usuario, Proveedor, Ingrediente, IngredienteProveedor
from app import app


class TestReporteHistorial(TestCase):
    """
    Conjunto de pruebas unitarias para la API de Reportes de historial de precios de ingredientes.
    Se valida:
      - Generación de reportes de historial de precios
    """

    def setUp(self):
        """
        Método que se ejecuta antes de cada test.
        - Inicializa la base de datos
        - Crea un usuario de prueba y obtiene token JWT
        - Crea ingredientes de prueba
        - Crea un proveedor de prueba y registra cambios de precios para generar historial
        """
        db.create_all()
        self.data_factory = Faker()
        self.client = app.test_client()
        self.ingredientes_creados = []

        # Crear usuario de prueba con contraseña encriptada
        nombre_usuario = 'test_' + self.data_factory.name()
        contrasena = 'T1$' + self.data_factory.word()
        contrasena_encriptada = hashlib.md5(contrasena.encode('utf-8')).hexdigest()
        usuario_nuevo = Usuario(usuario=nombre_usuario, contrasena=contrasena_encriptada)
        db.session.add(usuario_nuevo)
        db.session.commit()

        # Login y obtención del token JWT
        usuario_login = {"usuario": nombre_usuario, "contrasena": contrasena}
        solicitud_login = self.client.post(
            "/login",
            data=json.dumps(usuario_login),
            headers={'Content-Type': 'application/json'}
        )
        respuesta_login = json.loads(solicitud_login.get_data())
        self.token = respuesta_login["token"]
        self.usuario_id = respuesta_login["id"]

        # Encabezados con autenticación
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }

        # Crear ingrediente de prueba
        ingrediente_data = {
            "nombre": self.data_factory.word()
        }
        response = self.client.post("/ingredientes", data=json.dumps(ingrediente_data), headers=self.headers)
        ingrediente = Ingrediente.query.get(json.loads(response.get_data())['id'])
        self.ingredientes_creados.append(ingrediente)

        # Crear proveedor de prueba
        self.proveedor_data = {
            "nombre": self.data_factory.name(),
            "cedula": str(self.data_factory.random_number(digits=9)),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "direccion": self.data_factory.address(),
            "calificacion": self.data_factory.random.randint(1, 5)
        }
        response = self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        self.proveedor_id = response.json['id']

        # Registrar historial de precios para el proveedor
        # Primera actualización: precio inicial
        actualizar1 = {
            "nombre": self.data_factory.name(),
            "cedula": str(self.data_factory.random_number(digits=9)),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "direccion": self.data_factory.address(),
            "calificacion": self.data_factory.random.randint(1, 5),
            "ingredientes": [
                {"idIngrediente": self.ingredientes_creados[0].id, "precio": 10, "cantidad": 100}
            ]
        }
        response = self.client.put(f'/proveedor/{self.proveedor_id}', json=actualizar1, headers=self.headers)
        self.assertEqual(response.status_code, 200)

        # Segunda actualización: cambio de precio
        actualizar2 = {
            "nombre": self.data_factory.name(),
            "cedula": str(self.data_factory.random_number(digits=9)),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "direccion": self.data_factory.address(),
            "calificacion": self.data_factory.random.randint(1, 5),
            "ingredientes": [
                {"id": 1, "idIngrediente": self.ingredientes_creados[0].id, "precio": 50, "cantidad": 100}
            ]
        }
        response = self.client.put(f'/proveedor/{self.proveedor_id}', json=actualizar2, headers=self.headers)
        self.assertEqual(response.status_code, 200)

    def tearDown(self):
        """
        Método que se ejecuta después de cada test.
        - Limpia la sesión y borra todas las tablas
        """
        db.session.remove()
        db.drop_all()

    def test_reporte_historial(self):
        """
        Caso de prueba: Verificación del reporte de historial de precios
        - Consultar el endpoint de reporte
        - Comprobar que el historial contiene el precio inicial registrado
        """
        response = self.client.get('/reporte-historial-precios', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        reporte_data = response.get_json()

        # Verificación del primer precio histórico
        self.assertEqual(str(int(float(reporte_data[0]['precio']))), "10")
