# tests/test_menu.py
import json
import hashlib
from unittest import TestCase
from datetime import datetime, timedelta

from faker import Faker
from faker.generator import random
from modelos import (
    db, Usuario, Ingrediente, Receta, RecetaIngrediente,
    Menu, RecetaMenu, Restaurante, RestauranteReceta
)
from app import app


class TestMenu(TestCase):

    def setUp(self):
        db.drop_all()
        db.create_all()

        self.data_factory = Faker()
        self.client = app.test_client()

        # ---- usuario y login ----
        nombre_usuario = 'test_' + self.data_factory.name()
        contrasena = 'T1$' + self.data_factory.word()
        contrasena_encriptada = hashlib.md5(contrasena.encode('utf-8')).hexdigest()

        usuario_nuevo = Usuario(usuario=nombre_usuario, contrasena=contrasena_encriptada)
        db.session.add(usuario_nuevo)
        db.session.commit()

        usuario_login = {"usuario": nombre_usuario, "contrasena": contrasena}
        solicitud_login = self.client.post(
            "/login",
            data=json.dumps(usuario_login),
            headers={'Content-Type': 'application/json'}
        )
        respuesta_login = json.loads(solicitud_login.get_data())

        self.token = respuesta_login["token"]
        self.usuario_id = respuesta_login["id"]

        self.menus_creados = []
        self.recetas_creadas = []

        # ---- restaurante de contexto ----
        restaurante = Restaurante(
            nombre="Rico Rico",
            direccion="Calle 1",
            telefono="123",
            horario_atencion="8-18",
            tipo_comida="casera",
        )
        db.session.add(restaurante)
        db.session.commit()
        self.restaurante_id = restaurante.id

        # ---- ingrediente y recetas ----
        ingrediente = Ingrediente(nombre="Tomate")
        db.session.add(ingrediente)
        db.session.commit()

        receta = Receta(
            nombre="Ensalada",
            preparacion="Cortar tomates",
            usuario=self.usuario_id,
            duracion=10,
        )
        db.session.add(receta)
        db.session.commit()
        db.session.add(RecetaIngrediente(cantidad=200, ingrediente=ingrediente.id, receta=receta.id))
        db.session.commit()
        self.recetas_creadas.append(receta)

        receta2 = Receta(
            nombre="Sopa",
            preparacion="Hervir agua",
            usuario=self.usuario_id,
            duracion=15,
        )
        db.session.add(receta2)
        db.session.commit()
        db.session.add(RecetaIngrediente(cantidad=100, ingrediente=ingrediente.id, receta=receta2.id))
        db.session.commit()
        self.recetas_creadas.append(receta2)

        # Asignar recetas al restaurante (requisito de tus endpoints de menú)
        db.session.add(RestauranteReceta(restaurante_id=self.restaurante_id, receta_id=receta.id))
        db.session.add(RestauranteReceta(restaurante_id=self.restaurante_id, receta_id=receta2.id))
        db.session.commit()

    def tearDown(self):
        # borrar menús creados
        for menu in self.menus_creados:
            obj = Menu.query.get(menu.id)
            if obj:
                db.session.delete(obj)
                db.session.commit()

        # borrar recetas
        for receta in self.recetas_creadas:
            obj = Receta.query.get(receta.id)
            if obj:
                db.session.delete(obj)
                db.session.commit()

        # borrar restaurante
        rest = Restaurante.query.get(getattr(self, "restaurante_id", None))
        if rest:
            db.session.delete(rest)
            db.session.commit()

        # borrar usuario
        usuario_login = Usuario.query.get(self.usuario_id)
        if usuario_login:
            db.session.delete(usuario_login)
            db.session.commit()

    def _auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    # ----------------- TESTS -----------------

    def test_crear_menu(self):
        """Debe crear un menú correctamente y devolver 201."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)

        nuevo_menu = {
            "nombre": "Menu semanal",
            "fechainicio": fechainicio.strftime("%Y-%m-%d"),
            "fechafin": fechafin.strftime("%Y-%m-%d"),
            "descripcion": "Un menú de prueba",
            "autor_id": str(self.usuario_id),
            "recetas": json.dumps([{"idReceta": self.recetas_creadas[0].id, "personas": 2}]),
        }

        endpoint = f"/restaurantes/{self.restaurante_id}/menus"
        resultado = self.client.post(
            endpoint, data=nuevo_menu, headers=self._auth_headers(),
            content_type="multipart/form-data"
        )

        self.assertEqual(resultado.status_code, 201)
        datos_respuesta = json.loads(resultado.get_data())
        self.assertEqual(datos_respuesta["menu"]["nombre"], nuevo_menu["nombre"])
        self.assertEqual(datos_respuesta["menu"]["descripcion"], nuevo_menu["descripcion"])
        self.assertEqual(len(datos_respuesta["menu"]["recetas"]), 1)

        menu_creado = Menu.query.get(int(datos_respuesta["menu"]["id"]))
        self.assertIsNotNone(menu_creado)
        self.assertEqual(menu_creado.restaurante_id, self.restaurante_id)
        self.menus_creados.append(menu_creado)

    def test_get_menus_vacio(self):
        """Debe devolver 200 y un mensaje indicando que no hay menús registrados para este restaurante."""
        endpoint = f"/restaurantes/{self.restaurante_id}/menus"
        resultado = self.client.get(endpoint, headers=self._auth_headers())

        self.assertEqual(resultado.status_code, 200)
        datos_respuesta = json.loads(resultado.get_data())
        self.assertIn("mensaje", datos_respuesta)
        self.assertEqual(datos_respuesta["mensaje"], "No hay menús registrados para este restaurante")
        self.assertEqual(datos_respuesta["menus"], [])

    def test_get_menus_con_registros(self):
        """Debe devolver 200 y la lista de menús creados."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)

        nuevo_menu = Menu(
            nombre="Menu GET",
            fechainicio=fechainicio,
            fechafin=fechafin,
            descripcion="Un menú de prueba GET",
            autor_id=self.usuario_id,
            restaurante_id=self.restaurante_id,   # <-- obligatorio
        )
        receta_menu = RecetaMenu(receta=self.recetas_creadas[0], personas=3)
        nuevo_menu.recetas.append(receta_menu)
        db.session.add(nuevo_menu)
        db.session.commit()
        self.menus_creados.append(nuevo_menu)

        endpoint = f"/restaurantes/{self.restaurante_id}/menus"
        resultado = self.client.get(endpoint, headers=self._auth_headers())
        self.assertEqual(resultado.status_code, 200)

        datos_respuesta = json.loads(resultado.get_data())
        self.assertIn("menus", datos_respuesta)
        self.assertGreater(len(datos_respuesta["menus"]), 0)

        menu_respuesta = datos_respuesta["menus"][0]
        self.assertEqual(menu_respuesta["nombre"], nuevo_menu.nombre)
        self.assertEqual(menu_respuesta["descripcion"], nuevo_menu.descripcion)
        self.assertEqual(menu_respuesta["autor"]["id"], self.usuario_id)
        self.assertEqual(len(menu_respuesta["recetas"]), 1)
        self.assertEqual(menu_respuesta["recetas"][0]["id"], self.recetas_creadas[0].id)

    def test_delete_menu_no_existente(self):
        """Debe devolver 404 si el menú no existe al intentar eliminarlo."""
        endpoint = f"/restaurantes/{self.restaurante_id}/menu/9999"
        resultado = self.client.delete(endpoint, headers=self._auth_headers())
        self.assertEqual(resultado.status_code, 404)

    def test_post_menu_fechas_invalidas(self):
        """Debe devolver 400 si las fechas no abarcan exactamente 7 días."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=3)

        nuevo_menu = {
            "nombre": "Fechas malas",
            "fechainicio": fechainicio.strftime("%Y-%m-%d"),
            "fechafin": fechafin.strftime("%Y-%m-%d"),
            "descripcion": "desc",
            "autor_id": str(self.usuario_id),
            "recetas": json.dumps([{"idReceta": self.recetas_creadas[0].id, "personas": 2}]),
        }

        endpoint = f"/restaurantes/{self.restaurante_id}/menus"
        resultado = self.client.post(
            endpoint, data=nuevo_menu, headers=self._auth_headers(),
            content_type="multipart/form-data"
        )
        self.assertEqual(resultado.status_code, 400)
        datos_respuesta = json.loads(resultado.get_data())
        self.assertIn("El menú debe abarcar exactamente 7 días", datos_respuesta["mensaje"])

    def test_get_menu_por_id(self):
        """Debe devolver 200 y el detalle del menú al consultar por su ID."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)
        nuevo_menu = Menu(
            nombre="Menu detalle",
            fechainicio=fechainicio,
            fechafin=fechafin,
            descripcion="Menú para detalle",
            autor_id=self.usuario_id,
            restaurante_id=self.restaurante_id,   # <-- obligatorio
        )
        nuevo_menu.recetas.append(RecetaMenu(receta=self.recetas_creadas[0], personas=2))
        db.session.add(nuevo_menu)
        db.session.commit()
        self.menus_creados.append(nuevo_menu)

        endpoint = f"/restaurantes/{self.restaurante_id}/menu/{nuevo_menu.id}"
        resultado = self.client.get(endpoint, headers=self._auth_headers())
        self.assertEqual(resultado.status_code, 200)

        datos_respuesta = json.loads(resultado.get_data())
        self.assertIn("menu", datos_respuesta)
        self.assertEqual(datos_respuesta["menu"]["nombre"], nuevo_menu.nombre)
        self.assertEqual(len(datos_respuesta["menu"]["recetas"]), 1)
        self.assertEqual(datos_respuesta["menu"]["recetas"][0]["id"], self.recetas_creadas[0].id)

    def test_put_menu_actualizacion_exitosa(self):
        """Debe actualizar un menú existente correctamente."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)
        menu = Menu(
            nombre="Menu a actualizar",
            fechainicio=fechainicio,
            fechafin=fechafin,
            descripcion="Descripción vieja",
            autor_id=self.usuario_id,
            restaurante_id=self.restaurante_id,   # <-- obligatorio
        )
        menu.recetas.append(RecetaMenu(receta=self.recetas_creadas[0], personas=2))
        db.session.add(menu)
        db.session.commit()
        self.menus_creados.append(menu)

        data_actualizacion = {
            "nombre": "Menu actualizado",
            "descripcion": "Nueva descripción",
            "fechainicio": fechainicio.strftime("%Y-%m-%d"),
            "fechafin": (fechainicio + timedelta(days=6)).strftime("%Y-%m-%d"),
            "autor_id": str(self.usuario_id),
            "recetas": json.dumps([{"idReceta": self.recetas_creadas[1].id, "personas": 3}]),
        }

        endpoint = f"/restaurantes/{self.restaurante_id}/menu/{menu.id}"
        resultado = self.client.put(
            endpoint, data=data_actualizacion, headers=self._auth_headers(),
            content_type="multipart/form-data"
        )
        self.assertEqual(resultado.status_code, 200)

        datos_respuesta = json.loads(resultado.get_data())
        self.assertEqual(datos_respuesta["menu"]["nombre"], "Menu actualizado")
        self.assertEqual(datos_respuesta["menu"]["descripcion"], "Nueva descripción")
        self.assertEqual(len(datos_respuesta["menu"]["recetas"]), 1)
        self.assertEqual(int(datos_respuesta["menu"]["recetas"][0]["id"]), self.recetas_creadas[1].id)

    def test_put_menu_fechas_invalidas(self):
        """Debe devolver 400 al intentar actualizar un menú con fechas incorrectas."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)
        menu = Menu(
            nombre="Menu fechas invalidas",
            fechainicio=fechainicio,
            fechafin=fechafin,
            descripcion="Descripción",
            autor_id=self.usuario_id,
            restaurante_id=self.restaurante_id,   # <-- obligatorio
        )
        db.session.add(menu)
        db.session.commit()
        self.menus_creados.append(menu)

        data_actualizacion = {
            "nombre": "Nombre",
            "descripcion": "Desc",
            "fechainicio": fechainicio.strftime("%Y-%m-%d"),
            "fechafin": (fechainicio + timedelta(days=3)).strftime("%Y-%m-%d"),
            "autor_id": str(self.usuario_id),
            "recetas": json.dumps([{"idReceta": self.recetas_creadas[0].id, "personas": 2}]),
        }

        endpoint = f"/restaurantes/{self.restaurante_id}/menu/{menu.id}"
        resultado = self.client.put(
            endpoint, data=data_actualizacion, headers=self._auth_headers(),
            content_type="multipart/form-data"
        )

        self.assertEqual(resultado.status_code, 400)
        datos_respuesta = json.loads(resultado.get_data())
        self.assertIn("El menú debe abarcar exactamente 7 días", datos_respuesta["mensaje"])

    def test_delete_menu_existente(self):
        """Debe eliminar un menú existente y devolver 200."""
        fechainicio = datetime.now().date()
        fechafin = fechainicio + timedelta(days=6)
        menu = Menu(
            nombre="Menu a eliminar",
            fechainicio=fechainicio,
            fechafin=fechafin,
            descripcion="Descripción",
            autor_id=self.usuario_id,
            restaurante_id=self.restaurante_id,   # <-- obligatorio
        )
        db.session.add(menu)
        db.session.commit()
        self.menus_creados.append(menu)

        endpoint = f"/restaurantes/{self.restaurante_id}/menu/{menu.id}"
        resultado = self.client.delete(endpoint, headers=self._auth_headers())
        self.assertEqual(resultado.status_code, 200)

        datos_respuesta = json.loads(resultado.get_data())
        self.assertEqual(datos_respuesta["mensaje"], "Menú eliminado exitosamente")

        self.assertIsNone(Menu.query.get(menu.id))
