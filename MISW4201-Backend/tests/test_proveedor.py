import json
import hashlib
from unittest import TestCase

from faker import Faker
from faker.generator import random
from modelos import db, Usuario, Ingrediente
from app import app


class TestProveedores(TestCase):
    """
    Conjunto de pruebas unitarias para la API de Proveedores.
    Se valida:
      - Creación de proveedores
      - Listado de proveedores
      - Obtención de un proveedor específico
      - Actualización de proveedores y sus ingredientes
      - Eliminación de proveedores
    """

    def setUp(self):
        """
        Método que se ejecuta antes de cada test.
        - Inicializa la base de datos
        - Crea un usuario de prueba
        - Realiza login para obtener un token JWT
        - Crea algunos ingredientes de prueba para asociarlos con proveedores
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

        # Datos base para un proveedor de prueba
        self.proveedor_data = {
            "nombre": self.data_factory.name(),
            "cedula": str(self.data_factory.random_number(digits=9)),  # numérica para cumplir con el modelo
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "direccion": self.data_factory.address(),
            "calificacion": self.data_factory.random.randint(1, 5)
        }

        # Crear ingredientes de prueba y almacenarlos en la lista
        for _ in range(3):
            ingrediente_data = {
                "nombre": self.data_factory.word(),
                "unidad": self.data_factory.word(),
            }
            response = self.client.post("/ingredientes", data=json.dumps(ingrediente_data), headers=self.headers)
            ingrediente = Ingrediente.query.get(json.loads(response.get_data())['id'])
            self.ingredientes_creados.append(ingrediente)

    def tearDown(self):
        """
        Método que se ejecuta después de cada test.
        - Elimina la sesión de la base de datos
        - Borra todas las tablas
        """
        db.session.remove()
        db.drop_all()

    def test_crear_proveedor(self):
        """
        Caso de prueba: Crear un nuevo proveedor.
        - Se envían los datos de un proveedor válido
        - Se espera código de estado 201
        - La respuesta debe contener un campo 'id'
        """
        response = self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json)

    def test_listar_proveedores(self):
        """
        Caso de prueba: Listar todos los proveedores.
        - Se crea un proveedor
        - Se hace GET a /proveedores
        - Se espera código 200 y una lista en la respuesta
        """
        self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        response = self.client.get('/proveedores', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    def test_obtener_proveedor(self):
        """
        Caso de prueba: Obtener un proveedor específico.
        - Se crea un proveedor
        - Se consulta por su ID
        - La respuesta debe contener el mismo ID, el mismo nombre y el campo 'ingredientes'
        """
        response = self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        proveedor_id = response.json['id']

        response = self.client.get(f'/proveedor/{proveedor_id}', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['id'], proveedor_id)
        self.assertEqual(response.json['nombre'], self.proveedor_data['nombre'])
        self.assertIn('ingredientes', response.json)

    def test_actualizar_proveedor(self):
        """
        Caso de prueba: Actualizar un proveedor existente.
        - Se crea un proveedor inicial
        - Se envían nuevos datos (incluyendo ingredientes con precios)
        - Se verifica que la respuesta tenga código 200
        - Se valida que el proveedor se actualice con el mismo ID
        - Se comprueba que la lista de ingredientes incluya los nuevos IDs y precios,
        sin importar el orden en que lleguen.
        """
        # Crear proveedor inicial
        response = self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        proveedor_id = response.json['id']

        # Nuevos datos para actualizar
        nuevos_datos = {
            "nombre": self.data_factory.name(),
            "cedula": str(self.data_factory.random_number(digits=9)),
            "telefono": self.data_factory.phone_number(),
            "correo": self.data_factory.email(),
            "direccion": self.data_factory.address(),
            "calificacion": self.data_factory.random.randint(1, 5),
            "ingredientes": [
                {"idIngrediente": self.ingredientes_creados[0].id, "precio": 10.5, "cantidad": 100},
                {"idIngrediente": self.ingredientes_creados[1].id, "precio": 20.0, "cantidad": 200}
            ]
        }

        # Hacer la petición PUT
        response = self.client.put(f'/proveedor/{proveedor_id}', json=nuevos_datos, headers=self.headers)

        # Validaciones
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['id'], proveedor_id)
        self.assertEqual(len(response.json['ingredientes']), 2)

        # Mapear ingredientes por ID para validar sin importar el orden
        ingredientes_respuesta = {
            ing['ingrediente']['id']: ing for ing in response.json['ingredientes']
        }

        # Validar existencia de los ingredientes
        self.assertIn(str(self.ingredientes_creados[0].id), ingredientes_respuesta)
        self.assertIn(str(self.ingredientes_creados[1].id), ingredientes_respuesta)

        # Validar precios y cantidades
        self.assertEqual(
            ingredientes_respuesta[str(self.ingredientes_creados[0].id)]['precio'], 10.5
        )
        self.assertEqual(
            ingredientes_respuesta[str(self.ingredientes_creados[1].id)]['precio'], 20.0
        )
        self.assertEqual(
            ingredientes_respuesta[str(self.ingredientes_creados[0].id)]['cantidad'], 100
        )
        self.assertEqual(
            ingredientes_respuesta[str(self.ingredientes_creados[1].id)]['cantidad'], 200
        )


    def test_eliminar_proveedor(self):
        """
        Caso de prueba: Eliminar un proveedor.
        - Se crea un proveedor
        - Se elimina por su ID
        - La eliminación debe devolver código 204
        - Consultar nuevamente el proveedor debe devolver 404
        """
        response = self.client.post('/proveedores', json=self.proveedor_data, headers=self.headers)
        proveedor_id = response.json['id']

        response = self.client.delete(f'/proveedor/{proveedor_id}', headers=self.headers)
        self.assertEqual(response.status_code, 204)

        response = self.client.get(f'/proveedor/{proveedor_id}', headers=self.headers)
        self.assertEqual(response.status_code, 404)
