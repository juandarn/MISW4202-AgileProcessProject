import json
import hashlib
from unittest import TestCase

from faker import Faker
from modelos import db, Usuario, Proveedor, Ingrediente, IngredienteProveedor
from app import app


class TestReporteIngredientesProveedor(TestCase):
    """
    Conjunto de pruebas unitarias para la API de reporte de ingredientes por proveedor.
    Se valida:
      - Creación de ingredientes y proveedores
      - Asociación de ingredientes a proveedores con precios
      - Generación correcta del reporte de ingredientes por proveedor
    """

    def setUp(self):
        """
        Inicializa la base de datos y los datos de prueba:
        - Crea un usuario y obtiene un token JWT
        - Crea un ingrediente de prueba
        - Crea un proveedor de prueba
        - Asocia el ingrediente al proveedor con un precio inicial
        """
        db.create_all()
        self.data_factory = Faker()
        self.client = app.test_client()
        self.ingredientes_creados = []

        # Crear usuario de prueba
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

        # Encabezados con autenticación
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }

        # Crear ingrediente de prueba
        ingrediente_data = {
            "nombre": self.data_factory.word(),
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

        # Asociar ingrediente al proveedor con precio inicial
        self.actualizar = {
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
        response = self.client.put(f'/proveedor/{self.proveedor_id}', json=self.actualizar, headers=self.headers)
        self.assertEqual(response.status_code, 200)

    def tearDown(self):
        """
        Limpia la base de datos después de cada test
        """
        db.session.remove()
        db.drop_all()

    def test_reporte_ingredientes_proveedor(self):
        """
        Caso de prueba: Validación del endpoint de reporte de ingredientes por proveedor.
        - Consulta el endpoint
        - Verifica que se devuelva al menos un registro
        - Comprueba que el registro contenga los datos correctos de ingrediente, proveedor y precio
        """
        response = self.client.get('/reporte-ingrediente-proveedor', headers=self.headers)
        self.assertEqual(response.status_code, 200)

        reporte_data = response.get_json()
        self.assertTrue(len(reporte_data) > 0, "El reporte debería contener al menos un registro")

        registro = reporte_data[0]

        # Validaciones del registro
        self.assertEqual(int(float(registro['precio'])), 10, "El precio registrado no coincide")
        self.assertEqual(registro['ingrediente']['nombre'], self.ingredientes_creados[0].nombre, "Nombre del ingrediente incorrecto")
        self.assertEqual(registro['proveedor']['nombre'], self.actualizar['nombre'], "Nombre del proveedor incorrecto")
        self.assertEqual(registro['proveedor']['telefono'], self.actualizar['telefono'], "Teléfono del proveedor incorrecto")
        self.assertEqual(registro['proveedor']['direccion'], self.actualizar['direccion'], "Dirección del proveedor incorrecta")
        self.assertEqual(int(registro['proveedor']['calificacion']), self.actualizar['calificacion'], "Calificación del proveedor incorrecta")
