import json
import hashlib
from unittest import TestCase

from faker import Faker
from modelos import db, Usuario
from app import app


class TestChefs(TestCase):
    """
    Conjunto de pruebas unitarias para la API de Chefs.
    Se valida:
      - Creación de chefs
      - Listado de chefs
      - Obtención de un chef específico
      - Actualización de chefs
      - Eliminación de chefs
    """

    def setUp(self):
        """
        Método que se ejecuta antes de cada test.
        - Inicializa la base de datos
        - Crea un usuario de prueba
        - Realiza login para obtener un token JWT
        """
        db.create_all()
        self.data_factory = Faker()
        self.client = app.test_client()

        # Crear usuario de prueba con contraseña encriptada
        nombre_usuario = 'test_' + self.data_factory.user_name()
        contrasena = 'T1$' + self.data_factory.word()
        contrasena_encriptada = hashlib.md5(contrasena.encode('utf-8')).hexdigest()
        usuario_nuevo = Usuario(usuario=nombre_usuario, contrasena=contrasena_encriptada)
        db.session.add(usuario_nuevo)
        db.session.commit()

        # Hacer login y obtener token JWT
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

        # Datos base para un chef de prueba
        self.chef_data = {
            "usuario": self.data_factory.user_name(),
            "contrasena": "Test123!",
            "nombre": self.data_factory.name(),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "especialidad": self.data_factory.word()
        }

    def tearDown(self):
        """
        Método que se ejecuta después de cada test.
        - Elimina la sesión de la base de datos
        - Borra todas las tablas
        """
        db.session.remove()
        db.drop_all()

    def test_crear_chef(self):
        """
        Caso de prueba: Crear un nuevo chef.
        - Se envían los datos de un chef válido
        - Se espera código de estado 201
        - La respuesta debe contener un campo 'id'
        """
        response = self.client.post('/chefs', json=self.chef_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)

    def test_listar_chefs(self):
        """
        Caso de prueba: Listar todos los chefs.
        - Se crea un chef
        - Se hace GET a /chefs
        - Se espera código 200 y una lista en la respuesta
        """
        self.client.post('/chefs', json=self.chef_data, headers=self.headers)
        response = self.client.get('/chefs', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    def test_obtener_chef(self):
        """
        Caso de prueba: Obtener un chef específico.
        - Se crea un chef
        - Se consulta por su ID
        - La respuesta debe contener el mismo ID y el mismo nombre
        """
        response = self.client.post('/chefs', json=self.chef_data, headers=self.headers)
        chef_id = response.json['id']

        response = self.client.get(f'/chef/{chef_id}', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['id'], chef_id)
        self.assertEqual(response.json['nombre'], self.chef_data['nombre'])

    def test_actualizar_chef(self):
        """
        Caso de prueba: Actualizar un chef existente.
        - Se crea un chef inicial
        - Se envían nuevos datos
        - Se espera código 200 y que se mantenga el mismo ID
        """
        response = self.client.post('/chefs', json=self.chef_data, headers=self.headers)
        chef_id = response.json['id']

        nuevos_datos = {
            "usuario": self.data_factory.user_name(),
            "contrasena": "NewPass123!",
            "nombre": self.data_factory.name(),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "especialidad": self.data_factory.word()
        }

        response = self.client.put(f'/chef/{chef_id}', json=nuevos_datos, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['id'], chef_id)
        self.assertEqual(response.json['nombre'], nuevos_datos['nombre'])

    def test_eliminar_chef(self):
        """
        Caso de prueba: Eliminar un chef.
        - Se crea un chef
        - Se elimina por su ID
        - La eliminación debe devolver código 204
        - Consultar nuevamente el chef debe devolver 404
        """
        response = self.client.post('/chefs', json=self.chef_data, headers=self.headers)
        chef_id = response.json['id']

        response = self.client.delete(f'/chef/{chef_id}', headers=self.headers)
        self.assertEqual(response.status_code, 204)

        response = self.client.get(f'/chef/{chef_id}', headers=self.headers)
        self.assertEqual(response.status_code, 404)
