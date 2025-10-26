import base64
import os
import uuid
from flask import json, request
from flask_jwt_extended import jwt_required, create_access_token
from flask_restful import Resource
from modelos.modelos import Admin, AdminSchema, Menu, MenuSchema, RecetaMenu, RecetaMenuSchema
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from werkzeug.utils import secure_filename
from datetime import datetime, timezone, timedelta
import hashlib
from sqlalchemy.orm import joinedload, load_only

from modelos import \
    db, \
    Ingrediente, IngredienteSchema, \
    RecetaIngrediente, RecetaIngredienteSchema, \
    Receta, RecetaSchema, \
    Usuario, UsuarioSchema, \
    Chef, ChefSchema, \
    Proveedor, ProveedorSchema, \
    IngredienteProveedor, IngredienteProveedorSchema, IngredienteProveedorHistorial,IngredienteProveedorHistorialSchema,Restaurante,RestauranteSchema, \
    RestauranteReceta, RestauranteRecetaSchema


ingrediente_schema = IngredienteSchema()
receta_ingrediente_schema = RecetaIngredienteSchema()
receta_schema = RecetaSchema()
usuario_schema = UsuarioSchema()
menu_schema = MenuSchema()
receta_menu_schema = RecetaMenuSchema()
proveedor_schema = ProveedorSchema()
ingrediente_proveedor_schema = IngredienteProveedorSchema()
restaurante_schema = RestauranteSchema()
chef_schema = ChefSchema()
admin_schema = AdminSchema()
restaurante_receta_schema = RestauranteRecetaSchema()


class AdminResource(Resource):

    def post(self):
        """Crea un usuario tipo Admin"""
        usuario = Usuario.query.filter(
            Usuario.usuario == request.json["usuario"]
        ).first()

        if usuario is None:
            contrasena_encriptada = hashlib.md5(
                request.json["contrasena"].encode('utf-8')
            ).hexdigest()

            nuevo_admin = Admin(
                usuario=request.json["usuario"],
                contrasena=contrasena_encriptada
            )

            db.session.add(nuevo_admin)
            db.session.commit()

            token_de_acceso = create_access_token(identity=nuevo_admin.id)

            return {
                "mensaje": "Admin creado exitosamente",
                "id": nuevo_admin.id,
                "rol": nuevo_admin.tipo,
                "token": token_de_acceso
            }

        else:
            return {"mensaje": "El usuario ya existe"}, 404


class VistaSignIn(Resource):

    def post(self):
        usuario = Usuario.query.filter(
            Usuario.usuario == request.json["usuario"]
        ).first()

        if usuario is None:
            contrasena_encriptada = hashlib.md5(
                request.json["contrasena"].encode('utf-8')
            ).hexdigest()

            nuevo_usuario = Chef(
                usuario=request.json["usuario"],
                contrasena=contrasena_encriptada,
                nombre=request.json.get("nombre", ""),
                telefono=request.json.get("telefono", ""),
                correo=request.json.get("correo", ""), 
                especialidad=request.json.get("especialidad", "")
            )

            db.session.add(nuevo_usuario)
            db.session.commit()

            token_de_acceso = create_access_token(identity=nuevo_usuario.id)

            return {
                "mensaje": "Usuario creado exitosamente",
                "id": nuevo_usuario.id,
                "rol": nuevo_usuario.tipo,
                "token": token_de_acceso
            }

        else:
            return {"mensaje": "El usuario ya existe"}, 404

    def put(self, id_usuario):
        usuario = Usuario.query.get_or_404(id_usuario)
        usuario.contrasena = request.json.get("contrasena", usuario.contrasena)
        db.session.commit()
        return usuario_schema.dump(usuario)

    def delete(self, id_usuario):
        usuario = Usuario.query.get_or_404(id_usuario)
        db.session.delete(usuario)
        db.session.commit()
        return '', 204


class VistaLogIn(Resource):

    def post(self):
        contrasena_encriptada = hashlib.md5(
            request.json["contrasena"].encode('utf-8')
        ).hexdigest()

        usuario = Usuario.query.filter(
            Usuario.usuario == request.json["usuario"],
            Usuario.contrasena == contrasena_encriptada
        ).first()

        db.session.commit()

        if usuario is None:
            return {"mensaje": "El usuario no existe"}, 404
        else:
            token_de_acceso = create_access_token(identity=usuario.id)

            return {
                "mensaje": "Inicio de sesión exitoso",
                "token": token_de_acceso,
                "id": usuario.id,
                "rol": usuario.tipo
            }


class VistaIngredientes(Resource):
    @jwt_required()
    def get(self):
        ingredientes = Ingrediente.query.all()
        resultado = []

        for ingrediente in ingredientes:
            # Buscar si ya tiene un proveedor elegido explícitamente
            elegido = (
                IngredienteProveedor.query
                .filter_by(ingrediente_id=ingrediente.id, elegido=True)
                .first()
            )

            if not elegido:
                # Si no tiene proveedor elegido, tomar el más barato
                elegido = (
                    IngredienteProveedor.query
                    .filter_by(ingrediente_id=ingrediente.id)
                    .order_by(IngredienteProveedor.precio.asc())
                    .first()
                )

            # Sumar todas las cantidades de este ingrediente
            total_cantidad = (
                db.session.query(db.func.sum(IngredienteProveedor.cantidad))
                .filter_by(ingrediente_id=ingrediente.id)
                .scalar()
            ) or 0

            ingrediente_data = ingrediente_schema.dump(ingrediente)

            if elegido:
                ingrediente_data['mejor_precio'] = float(elegido.precio)
                ingrediente_data['mejor_proveedor'] = {
                    'id': elegido.proveedor.id,
                    'nombre': elegido.proveedor.nombre
                }
            else:
                ingrediente_data['mejor_precio'] = None
                ingrediente_data['mejor_proveedor'] = None

            ingrediente_data['total_cantidad'] = int(total_cantidad)
            resultado.append(ingrediente_data)

        return resultado, 200


    @jwt_required()
    def post(self):
        nombre = request.json["nombre"].strip().lower()

        # Verificar si ya existe un ingrediente con ese nombre (sin importar mayúsculas/minúsculas)
        ingrediente_existente = Ingrediente.query.filter(
            db.func.lower(Ingrediente.nombre) == nombre
        ).first()

        if ingrediente_existente:
            return {"mensaje": "El ingrediente ya existe"}, 400

        nuevo_ingrediente = Ingrediente(
            nombre=nombre,
        )

        db.session.add(nuevo_ingrediente)
        db.session.commit()
        return ingrediente_schema.dump(nuevo_ingrediente), 201

class VistaRestaurantes(Resource):
    
    @jwt_required()
    def get(self):
        """
        Obtiene todos los restaurantes.
        - Requiere autenticación JWT.
        - Retorna una lista de restaurantes serializados en JSON.
        """
        restaurantes = Restaurante.query.all()
        resultado = []

        IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")

        for r in restaurantes:
            restaurante = restaurante_schema.dump(r)

            if r.foto_url:
                image_path = os.path.join(IMAGES_DIR, os.path.basename(r.foto_url))
                try:
                    with open(image_path, "rb") as f:
                        foto = base64.b64encode(f.read()).decode("utf-8")
                except FileNotFoundError:
                    foto = None
            else:
                foto = None

            restaurante["foto"] = foto
            resultado.append(restaurante)

        return resultado, 200


    @jwt_required()
    def post(self):
        data = request.form.to_dict()
        
        IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
        foto_url = None
        if "foto" in request.files:
            foto = request.files["foto"]
            if foto and foto.filename != "":
                filename = secure_filename(foto.filename)
                ext = os.path.splitext(filename)[1]
                unique_name = f"{uuid.uuid4().hex}{ext}"
                save_path = os.path.join(IMAGES_DIR, unique_name)
                foto.save(save_path)
                foto_url = f"/images/{unique_name}"
        
        nuevo_restaurante = Restaurante(
            nombre=data["nombre"],
            direccion=data["direccion"],
            telefono=data["telefono"],
            horario_atencion=data["horario_atencion"],
            tipo_comida=data["tipo_comida"],
            foto_url = foto_url
        )
        db.session.add(nuevo_restaurante)
        db.session.commit()
        return restaurante_schema.dump(nuevo_restaurante), 201
    
class VistaRestaurante(Resource):
    @jwt_required()
    def get(self, id_restaurante):
        restaurante_obj = Restaurante.query.get_or_404(id_restaurante)
        restaurante = restaurante_schema.dump(restaurante_obj)

        if not restaurante:
            return {"mensaje": "Restaurante no encontrado"}, 404

        if restaurante_obj.foto_url:
            IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
            image_path = os.path.join(IMAGES_DIR, os.path.basename(restaurante_obj.foto_url))
            try:
                with open(image_path, "rb") as f:
                    foto = base64.b64encode(f.read()).decode("utf-8")
            except FileNotFoundError:
                foto = None
        else:
            foto = None

        restaurante["foto"] = foto

        return restaurante, 200

    def put(self, id_restaurante):
        restaurante = Restaurante.query.get_or_404(id_restaurante)
        data = request.form.to_dict()

        restaurante.horario_atencion = data.get("horario_atencion", restaurante.horario_atencion)
        restaurante.telefono = data.get("telefono", restaurante.telefono)
        restaurante.direccion = data.get("direccion", restaurante.direccion)
        restaurante.nombre = data.get("nombre", restaurante.nombre)
        restaurante.tipo_comida = data.get("tipo_comida", restaurante.tipo_comida)

        if data.get("eliminar_foto") == "true":
            restaurante.foto_url = None

        if "foto" in request.files:
            foto = request.files["foto"]
            if foto and foto.filename != "":
                IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
                os.makedirs(IMAGES_DIR, exist_ok=True)

                filename = secure_filename(foto.filename)
                ext = os.path.splitext(filename)[1]
                unique_name = f"{uuid.uuid4().hex}{ext}"
                save_path = os.path.join(IMAGES_DIR, unique_name)

                foto.save(save_path)
                restaurante.foto_url = f"/images/{unique_name}"

        db.session.commit()
        return restaurante_schema.dump(restaurante), 200


    @jwt_required()
    def delete(self, id_restaurante):
        try:
            restaurante = Restaurante.query.get_or_404(id_restaurante)
            db.session.delete(restaurante)
            db.session.commit()
            return {"mensaje": "restaurante eliminado exitosamente"}, 200
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error al eliminar el restaurante: {str(e)}"}, 500

     

class VistaIngrediente(Resource):
    @jwt_required()
    def get(self, id_ingrediente):
        ingrediente = Ingrediente.query.get_or_404(id_ingrediente)

        # Buscar si ya tiene un proveedor elegido explícitamente
        elegido = (
            IngredienteProveedor.query
            .filter_by(ingrediente_id=ingrediente.id, elegido=True)
            .first()
        )

        if not elegido:
            # Si no hay proveedor elegido, usar el más barato
            elegido = (
                IngredienteProveedor.query
                .filter_by(ingrediente_id=ingrediente.id)
                .order_by(IngredienteProveedor.precio.asc())
                .first()
            )

        # Sumar todas las cantidades
        total_cantidad = (
            db.session.query(db.func.sum(IngredienteProveedor.cantidad))
            .filter_by(ingrediente_id=ingrediente.id)
            .scalar()
        ) or 0

        ingrediente_data = ingrediente_schema.dump(ingrediente)

        if elegido:
            ingrediente_data['mejor_precio'] = float(elegido.precio)
            ingrediente_data['mejor_proveedor'] = {
                'id': elegido.proveedor.id,
                'nombre': elegido.proveedor.nombre
            }
        else:
            ingrediente_data['mejor_precio'] = None
            ingrediente_data['mejor_proveedor'] = None

        ingrediente_data['total_cantidad'] = int(total_cantidad)
        return ingrediente_data, 200

    @jwt_required()
    def put(self, id_ingrediente):
        ingrediente = Ingrediente.query.get_or_404(id_ingrediente)
        data = request.get_json()

        # Actualizar nombre si viene
        if "nombre" in data:
            ingrediente.nombre = data["nombre"]

        # Si viene un proveedor elegido (Angular lo manda como proveedorId)
        proveedor_id = data.get("proveedorId")
        if proveedor_id:
            # Resetear todos a False para este ingrediente
            IngredienteProveedor.query.filter_by(
                ingrediente_id=ingrediente.id
            ).update({"elegido": False})

            # Marcar el nuevo como elegido
            relacion = IngredienteProveedor.query.filter_by(
                ingrediente_id=ingrediente.id,
                proveedor_id=proveedor_id
            ).first()

            if relacion:
                relacion.elegido = True
            else:
                return {"error": "El proveedor no está asociado a este ingrediente"}, 400

        db.session.commit()
        return ingrediente_schema.dump(ingrediente), 200



    @jwt_required()
    def delete(self, id_ingrediente):
        ingrediente = Ingrediente.query.get_or_404(id_ingrediente)
        recetasIngrediente = RecetaIngrediente.query.filter_by(ingrediente=id_ingrediente).all()

        if len(recetasIngrediente) == 0:
            db.session.delete(ingrediente)
            db.session.commit()
            return '', 204
        else:
            return 'El ingrediente se está usando en diferentes recetas', 409

class VistaRecetas(Resource):
    @jwt_required()
    def get(self, id_restaurante):
        # Traer SOLO las recetas asignadas al restaurante
        recetas = (
            Receta.query
            .join(RestauranteReceta, Receta.id == RestauranteReceta.receta_id)
            .filter(
                RestauranteReceta.restaurante_id == id_restaurante
            )
            .all()
        )

        resultados = [receta_schema.dump(receta) for receta in recetas]

        ingredientes = Ingrediente.query.all()
        for receta in resultados:
            for receta_ingrediente in receta['ingredientes']:
                self.actualizar_ingredientes_util(receta_ingrediente, ingredientes)

        return resultados

    @jwt_required()
    def post(self, id_restaurante):
        nueva_receta = Receta(
            nombre=request.json["nombre"],
            preparacion=request.json["preparacion"],
            ingredientes=[],
            duracion=float(request.json["duracion"])
        )
        for receta_ingrediente in request.json["ingredientes"]:
            nueva_receta_ingrediente = RecetaIngrediente(
                cantidad=receta_ingrediente["cantidad"],
                ingrediente=int(receta_ingrediente["idIngrediente"])
            )
            nueva_receta.ingredientes.append(nueva_receta_ingrediente)
        
        db.session.add(nueva_receta)
        db.session.commit()

        # 🔗 Crear vínculo obligatorio con restaurante
        asignacion = RestauranteReceta(
            restaurante_id=id_restaurante,
            receta_id=nueva_receta.id
        )
        db.session.add(asignacion)
        db.session.commit()

        return receta_schema.dump(nueva_receta)

    def actualizar_ingredientes_util(self, receta_ingrediente, ingredientes):
        for ingrediente in ingredientes: 
            if str(ingrediente.id) == str(receta_ingrediente['ingrediente']):
                receta_ingrediente['ingrediente'] = ingrediente_schema.dump(ingrediente)

class VistaReceta(Resource):
    @jwt_required()
    def get(self, id_restaurante, id_receta):
        # ¿La receta está asignada al restaurante?
        asignada = RestauranteReceta.query.filter_by(
            restaurante_id=int(id_restaurante),
            receta_id=int(id_receta)
        ).first()

        if not asignada:
            return {"mensaje": "La receta no está asignada a este restaurante."}, 404

        # Traer la receta
        receta = Receta.query.get_or_404(id_receta)
        data = receta_schema.dump(receta)

        # Mapear ingredientes (id -> objeto)
        ingredientes_map = {
            str(ing.id): ingrediente_schema.dump(ing)
            for ing in Ingrediente.query.all()
        }

        for ri in data.get('ingredientes', []):
            ing_id = str(ri.get('ingrediente'))
            if ing_id in ingredientes_map:
                ri['ingrediente'] = ingredientes_map[ing_id]

        return data, 200


    @jwt_required()
    def put(self, id_restaurante, id_receta):
        # Igual que antes, pero asegurando que la receta esté asignada al restaurante
        asignacion = RestauranteReceta.query.filter_by(
            restaurante_id=id_restaurante,
            receta_id=id_receta
        ).first_or_404()

        receta = Receta.query.get_or_404(id_receta)
        receta.nombre = request.json["nombre"]
        receta.preparacion = request.json["preparacion"]
        receta.duracion = float(request.json["duracion"])

        # --- ingredientes ---
        for receta_ingrediente in receta.ingredientes[:]:
            borrar = self.borrar_ingrediente_util(request.json["ingredientes"], receta_ingrediente)
            if borrar:
                db.session.delete(receta_ingrediente)

        for ing_editar in request.json["ingredientes"]:
            if not ing_editar.get('id') or ing_editar['id'] in (0, ""):
                ingrediente_obj = Ingrediente.query.get(ing_editar["idIngrediente"])
                nueva_receta_ing = RecetaIngrediente(
                    cantidad=ing_editar["cantidad"],
                    ingrediente=ingrediente_obj.id,
                    ingrediente_ref=ingrediente_obj,
                    receta=receta.id
                )
                receta.ingredientes.append(nueva_receta_ing)
                db.session.flush()
            else:
                ing_existente = RecetaIngrediente.query.get(int(ing_editar['id']))
                if ing_existente:
                    ing_existente.cantidad = ing_editar["cantidad"]
                    ing_existente.ingrediente = int(ing_editar["idIngrediente"])
                    db.session.add(ing_existente)

        db.session.add(receta)
        db.session.commit()
        return receta_schema.dump(receta)


    @jwt_required()
    def delete(self, id_restaurante, id_receta):
        # normalizamos a int
        id_restaurante = int(id_restaurante)
        id_receta = int(id_receta)

        # buscamos SOLO la relación
        asignacion = RestauranteReceta.query.filter_by(
            restaurante_id=id_restaurante,
            receta_id=id_receta
        ).first()

        if not asignacion:
            return {"mensaje": "La receta no está asignada a este restaurante."}, 404

        # eliminamos la fila de la tabla puente (NO la receta)
        db.session.delete(asignacion)
        db.session.commit()

        # 204 = sin contenido
        return '', 204
    
    def borrar_ingrediente_util(self, receta_ingredientes, receta_ingrediente):
        borrar = True
        for receta_ingrediente_editar in receta_ingredientes:
            if receta_ingrediente_editar['id'] != '':
                if int(receta_ingrediente_editar['id']) == receta_ingrediente.id:
                    borrar = False
        return borrar

    def actualizar_ingrediente_util(self, receta_ingredientes, receta_ingrediente_editar):
        receta_ingrediente_retornar = None
        for receta_ingrediente in receta_ingredientes:
            if int(receta_ingrediente_editar['id']) == receta_ingrediente.id:
                receta_ingrediente.cantidad = receta_ingrediente_editar['cantidad']
                receta_ingrediente.ingrediente = int(receta_ingrediente_editar['idIngrediente'])
                receta_ingrediente_retornar = receta_ingrediente
        return receta_ingrediente_retornar

class VistaMenus(Resource):
    """
    Menús filtrados por restaurante.
    Rutas nuevas:
      GET  /restaurantes/<id_restaurante>/menus
      POST /restaurantes/<id_restaurante>/menus
    """

    @jwt_required()
    def get(self, id_restaurante):
        try:
            # asegurar que existe el restaurante
            Restaurante.query.get_or_404(id_restaurante)

            menus = Menu.query.filter_by(restaurante_id=int(id_restaurante)).all()
            if not menus:
                return {"mensaje": "No hay menús registrados para este restaurante", "menus": []}, 200

            return {
                "menus": [
                    {
                        "id": menu.id,
                        "nombre": menu.nombre,
                        "fechainicio": menu.fechainicio.strftime("%Y-%m-%d"),
                        "fechafin": menu.fechafin.strftime("%Y-%m-%d"),
                        "descripcion": menu.descripcion,
                        "autor": {
                            "id": menu.autor.id if menu.autor else None,
                            "nombre": menu.autor.usuario if menu.autor else None
                        },
                        "restaurante": {
                            "id": menu.restaurante.id,
                            "nombre": menu.restaurante.nombre
                        },
                        "recetas": [
                            {
                                "id": rm.receta.id,
                                "nombre": rm.receta.nombre,
                                "personas": rm.personas
                            } for rm in menu.recetas
                        ]
                    } for menu in menus
                ]
            }, 200

        except Exception as e:
            return {"mensaje": f"Error al obtener los menús: {str(e)}"}, 500

    @jwt_required()
    def post(self, id_restaurante):
        """
        Crea un menú PARA ese restaurante.
        Valida:
          - Campos obligatorios
          - 7 días
          - Autor existe
          - Cada receta existe y está asignada a este restaurante
        """
        try:
            Restaurante.query.get_or_404(id_restaurante)

            data = request.form.to_dict()
            try:
                data["recetas"] = json.loads(data["recetas"])
            except (json.JSONDecodeError, TypeError):
                return {"mensaje": "El campo 'recetas' debe ser una lista válida de objetos JSON"}, 400

            oblig = ["nombre", "fechainicio", "fechafin", "descripcion", "recetas", "autor_id"]
            faltantes = [c for c in oblig if c not in data or not data[c]]
            if faltantes:
                return {"mensaje": f"Faltan campos obligatorios: {', '.join(faltantes)}"}, 400

            fechainicio = datetime.strptime(data["fechainicio"], "%Y-%m-%d").date()
            fechafin = datetime.strptime(data["fechafin"], "%Y-%m-%d").date()
            if (fechafin - fechainicio).days != 6:
                return {"mensaje": "El menú debe abarcar exactamente 7 días consecutivos"}, 400

            autor_id = int(data.get("autor_id"))
            if not Usuario.query.get(autor_id):
                return {"mensaje": "El autor no existe"}, 404

            IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
            foto_url = None
            if "foto" in request.files:
                foto = request.files["foto"]
                if foto and foto.filename != "":
                    filename = secure_filename(foto.filename)
                    ext = os.path.splitext(filename)[1]
                    unique_name = f"{uuid.uuid4().hex}{ext}"
                    save_path = os.path.join(IMAGES_DIR, unique_name)
                    foto.save(save_path)
                    foto_url = f"/images/{unique_name}"

            nuevo_menu = Menu(
                nombre=data["nombre"],
                fechainicio=fechainicio,
                fechafin=fechafin,
                descripcion=data["descripcion"],
                autor_id=autor_id,
                foto_url=foto_url,
                restaurante_id=int(id_restaurante),   # 🔹 clave
            )

            # Validar recetas: existen y pertenecen al restaurante
            for r in data["recetas"]:
                receta_id = int(r.get("idReceta"))
                personas = int(r.get("personas"))

                receta = Receta.query.get(receta_id)
                if not receta:
                    return {"mensaje": f"La receta con id {receta_id} no existe"}, 404

                asignada = RestauranteReceta.query.filter_by(
                    restaurante_id=int(id_restaurante),
                    receta_id=receta_id
                ).first()
                if not asignada:
                    return {"mensaje": f"La receta {receta_id} no está asignada a este restaurante"}, 400

                nuevo_menu.recetas.append(RecetaMenu(receta=receta, personas=personas))

            db.session.add(nuevo_menu)
            db.session.commit()

            return {"mensaje": "Menú registrado exitosamente", "menu": menu_schema.dump(nuevo_menu)}, 201

        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error de integridad al registrar el menú"}, 500
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error inesperado: {str(e)}"}, 500

class VistaMenu(Resource):
    """
    Menú individual scoping por restaurante.
    Rutas:
      GET    /restaurantes/<id_restaurante>/menu/<id_menu>
      PUT    /restaurantes/<id_restaurante>/menu/<id_menu>
      DELETE /restaurantes/<id_restaurante>/menu/<id_menu>
    """

    @jwt_required()
    def get(self, id_restaurante, id_menu):
        try:
            menu = Menu.query.get(id_menu)
            if not menu or menu.restaurante_id != int(id_restaurante):
                return {"mensaje": "Menú no encontrado en este restaurante"}, 404

            if menu.foto_url:
                IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
                image_path = os.path.join(IMAGES_DIR, os.path.basename(menu.foto_url))
                with open(image_path, "rb") as f:
                    foto = base64.b64encode(f.read()).decode("utf-8")
            else:
                foto = None

            detalle = {
                "id": menu.id,
                "nombre": menu.nombre,
                "fechainicio": str(menu.fechainicio),
                "fechafin": str(menu.fechafin),
                "descripcion": menu.descripcion,
                "autor": {
                    "id": menu.autor.id if menu.autor else None,
                    "nombre": menu.autor.usuario if menu.autor else None,
                },
                "restaurante": {
                    "id": menu.restaurante.id,
                    "nombre": menu.restaurante.nombre
                },
                "recetas": [],
                "foto": foto
            }

            for rm in menu.recetas:
                detalle["recetas"].append({
                    "id": rm.receta.id,
                    "nombre": rm.receta.nombre,
                    "personas": rm.personas,
                })

            return {"menu": detalle}, 200

        except Exception as e:
            return {"mensaje": f"Error al obtener el detalle del menú: {str(e)}"}, 500

    @jwt_required()
    def put(self, id_restaurante, id_menu):
        try:
            menu = Menu.query.get(id_menu)
            if not menu or menu.restaurante_id != int(id_restaurante):
                return {"mensaje": "Menú no encontrado en este restaurante"}, 404

            data = request.form.to_dict()
            recetas_raw = data.get("recetas")
            if recetas_raw:
                try:
                    data["recetas"] = json.loads(recetas_raw)
                except json.JSONDecodeError:
                    return {"mensaje": "El campo 'recetas' debe ser JSON válido"}, 400
            else:
                data["recetas"] = []

            IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
            if "foto" in request.files:
                foto = request.files["foto"]
                if foto and foto.filename != "":
                    filename = secure_filename(foto.filename)
                    ext = os.path.splitext(filename)[1]
                    unique_name = f"{uuid.uuid4().hex}{ext}"
                    save_path = os.path.join(IMAGES_DIR, unique_name)
                    foto.save(save_path)
                    menu.foto_url = f"/images/{unique_name}"

            fechainicio = datetime.strptime(data["fechainicio"], "%Y-%m-%d").date()
            fechafin = datetime.strptime(data["fechafin"], "%Y-%m-%d").date()
            if (fechafin - fechainicio).days != 6:
                return {"mensaje": "El menú debe abarcar exactamente 7 días consecutivos"}, 400

            autor_id = data.get("autor_id")
            if not autor_id:
                return {"mensaje": "Debe especificar un autor (autor_id)"}, 400
            if not Usuario.query.get(autor_id):
                return {"mensaje": "El autor no existe"}, 404

            menu.nombre = data["nombre"]
            menu.descripcion = data["descripcion"]
            menu.fechainicio = fechainicio
            menu.fechafin = fechafin
            menu.autor_id = int(autor_id)
            # 🔒 no permitimos mover de restaurante aquí
            # menu.restaurante_id = menu.restaurante_id

            recetas_data = data.get("recetas", [])
            recetas_actuales = {rm.receta_id: rm for rm in menu.recetas}
            nuevas_recetas = []

            for r in recetas_data:
                receta_id = int(r.get("idReceta"))
                personas = int(r.get("personas"))

                receta = Receta.query.get(receta_id)
                if not receta:
                    return {"mensaje": f"La receta con id {receta_id} no existe"}, 404

                # validar que la receta pertenece al restaurante
                asignada = RestauranteReceta.query.filter_by(
                    restaurante_id=int(id_restaurante),
                    receta_id=receta_id
                ).first()
                if not asignada:
                    return {"mensaje": f"La receta {receta_id} no está asignada a este restaurante"}, 400

                if receta_id in recetas_actuales:
                    recetas_actuales[receta_id].personas = personas
                else:
                    nuevas_recetas.append(RecetaMenu(receta=receta, personas=personas))

            ids_recetas_enviadas = {int(r["idReceta"]) for r in recetas_data}
            for receta_id, receta_menu in list(recetas_actuales.items()):
                if receta_id not in ids_recetas_enviadas:
                    db.session.delete(receta_menu)

            menu.recetas.extend(nuevas_recetas)
            db.session.commit()

            return {"mensaje": "Menú actualizado exitosamente", "menu": menu_schema.dump(menu)}, 200

        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error de integridad al actualizar el menú"}, 500
    @jwt_required()
    def delete(self, id_restaurante, id_menu):
        try:
            menu = Menu.query.get(id_menu)
            if not menu or menu.restaurante_id != int(id_restaurante):
                return {"mensaje": "Menú no encontrado en este restaurante"}, 404

            db.session.delete(menu)
            db.session.commit()
            return {"mensaje": "Menú eliminado exitosamente"}, 200
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error al eliminar el menú: {str(e)}"}, 500


        
class VistaProveedores(Resource):
    """
    Vista para manejar la colección de proveedores.
    Permite listar todos los proveedores y crear uno nuevo.
    """
    
    @jwt_required()
    def get(self):
        """
        Obtiene todos los proveedores.
        - Requiere autenticación JWT.
        - Retorna una lista de proveedores serializados en JSON.
        """
        proveedores = Proveedor.query.all()  # Consuflta todos los proveedores de la base de datos
        return [proveedor_schema.dump(proveedor) for proveedor in proveedores]  # Serializa cada proveedor

    @jwt_required()
    def post(self):
        """
        Crea un nuevo proveedor.
        - Requiere autenticación JWT.
        - Recibe los datos en JSON en el cuerpo de la solicitud.
        - Retorna el proveedor creado con código HTTP 201.
        """
        nuevo_proveedor = Proveedor(
            nombre=request.json["nombre"],
            cedula=request.json["cedula"],
            telefono=request.json["telefono"],
            correo=request.json["correo"],
            direccion=request.json["direccion"],
            calificacion=int(request.json["calificacion"])
        )
        db.session.add(nuevo_proveedor)  # Agrega el proveedor a la sesión de la base de datos
        db.session.commit()  # Guarda los cambios en la base de datos
        return proveedor_schema.dump(nuevo_proveedor), 201  # Retorna el proveedor serializado
    

class VistaProveedor(Resource):
    """
    Vista para manejar un proveedor específico.
    Permite obtener, actualizar o eliminar un proveedor por su ID.
    """

    @jwt_required()
    
    def get(self, id_proveedor):
        """
        Obtiene el detalle de un proveedor específico.
        - Requiere autenticación JWT.
        - Recibe el id del proveedor en la URL.
        - Retorna el proveedor con todos sus atributos e ingredientes asociados.
        """
        proveedor = Proveedor.query.get_or_404(id_proveedor)
        resultados = proveedor_schema.dump(proveedor)
        return resultados


    @jwt_required()
    def put(self, id_proveedor):
        proveedor = Proveedor.query.get_or_404(id_proveedor)

        proveedor.nombre = request.json["nombre"]
        proveedor.cedula = request.json["cedula"]
        proveedor.telefono = request.json["telefono"]
        proveedor.correo = request.json["correo"]
        proveedor.direccion = request.json["direccion"]
        proveedor.calificacion = int(request.json["calificacion"])

        if "ingredientes" in request.json:
            nuevos_ingredientes = request.json["ingredientes"]

            ids_actuales = [ing.get("id") for ing in nuevos_ingredientes if ing.get("id")]
            for ing_proveedor in proveedor.ingredientes[:]:
                if str(ing_proveedor.id) not in map(str, ids_actuales):
                    db.session.delete(ing_proveedor)

            for ing in nuevos_ingredientes:
                if not ing.get("id") or ing.get("id") in (0, ""): 
                    nuevo_ing = IngredienteProveedor(
                        proveedor_id=id_proveedor,
                        ingrediente_id=ing["idIngrediente"],
                        precio=ing["precio"],
                        cantidad=ing["cantidad"]  
                    )
                    proveedor.ingredientes.append(nuevo_ing)

                    db.session.flush()

                    historial = IngredienteProveedorHistorial(
                        ingrediente_proveedor_id=nuevo_ing.id,
                        precio=nuevo_ing.precio,
                        fecha=datetime.now(timezone(timedelta(hours=-5)))
                    )
                    db.session.add(historial)
                else: 
                    ing_existente = IngredienteProveedor.query.get(ing["id"])
                    if ing_existente:
                        historial = IngredienteProveedorHistorial(
                            ingrediente_proveedor_id=ing_existente.id,
                            precio=ing_existente.precio,
                            fecha=datetime.now(timezone(timedelta(hours=-5)))  
                        )
                        db.session.add(historial)

                        ing_existente.precio = ing["precio"]
                        ing_existente.cantidad = ing["cantidad"] 
                        ing_existente.ingrediente_id = ing["idIngrediente"]
                    

        db.session.commit()
        return self.get(id_proveedor)



    @jwt_required()
    def delete(self, id_proveedor):
        """
        Elimina un proveedor específico.
        - Requiere autenticación JWT.
        - Elimina también los registros relacionados en IngredienteProveedor.
        - Retorna código HTTP 204 (sin contenido) al finalizar.
        """
        proveedor = Proveedor.query.get_or_404(id_proveedor)  # Obtener proveedor o 404
        # Borrar los registros relacionados en la tabla de ingredientes del proveedor
        IngredienteProveedor.query.filter_by(proveedor_id=id_proveedor).delete()
        db.session.delete(proveedor)  # Eliminar el proveedor
        db.session.commit()  # Guardar cambios
        return '', 204  # Respuesta vacía con código HTTP 204
    
class VistaPerfil(Resource):

    @jwt_required()
    def get(self, id_usuario):
        user = Usuario.query.get_or_404(id_usuario)
        if user.tipo=="admin":
            
             return {
                "usuario": user.usuario,
                "tipo": user.tipo,
                "pwd": user.contrasena,
                "nombre": None,
                "telefono": None,
                "correo": None,
                "especialidad": None
            }, 200
        
        elif user.tipo == "chef":
            chef: Chef = user 
            return {
                "usuario": chef.usuario,
                "tipo": chef.tipo,
                "pwd": chef.contrasena,
                "nombre": chef.nombre,
                "telefono": chef.telefono,
                "correo": chef.correo,
                "especialidad": chef.especialidad
            }, 200

        return {"error": "Tipo de usuario no reconocido"}, 400

    @jwt_required()
    def put(self, id_usuario):
        user = Usuario.query.get_or_404(id_usuario)
        data = request.get_json() or {}

        if "usuario" in data and data["usuario"]:
            user.usuario = data["usuario"]

        if "pwd" in data and data["pwd"]:
            nueva_pwd = data["pwd"]
            if nueva_pwd != user.contrasena:
                user.contrasena = hashlib.md5(
                    nueva_pwd.encode("utf-8")
                ).hexdigest()

        if user.tipo == "chef":
            chef: Chef = user
            chef.nombre = data.get("nombre", chef.nombre)
            chef.telefono = data.get("telefono", chef.telefono)
            chef.correo = data.get("correo", chef.correo)
            chef.especialidad = data.get("especialidad", chef.especialidad)

        db.session.commit()

        return {"mensaje": "Perfil actualizado correctamente"}, 200

class VistaChef(Resource):
    """
    Vista para manejar un chef específico.
    Permite obtener, actualizar o eliminar un chef por su ID.
    """

    @jwt_required()
    def get(self, id_chef):
        """
        Obtiene el detalle de un chef específico.
        - Requiere autenticación JWT.
        - Recibe el id del chef en la URL.
        - Retorna el chef con todos sus atributos.
        """
        chef = Chef.query.get_or_404(id_chef)
        resultados = chef_schema.dump(chef)
        return resultados, 200

    @jwt_required()
    def put(self, id_chef):
        """
        Actualiza la información de un chef específico.
        - Requiere autenticación JWT.
        - Recibe los datos del chef en el body (JSON).
        - Retorna el chef actualizado.
        """
        chef = Chef.query.get_or_404(id_chef)

        chef.nombre = request.json.get("nombre", chef.nombre)
        chef.telefono = request.json.get("telefono", chef.telefono)
        chef.correo = request.json.get("correo", chef.correo)
        chef.especialidad = request.json.get("especialidad", chef.especialidad)

        db.session.commit()
        return chef_schema.dump(chef), 200

    @jwt_required()
    def delete(self, id_chef):
        """
        Elimina un chef específico.
        - Requiere autenticación JWT.
        - Retorna código HTTP 204 (sin contenido) al finalizar.
        """
        chef = Chef.query.get_or_404(id_chef)
        db.session.delete(chef)
        db.session.commit()
        return '', 204

class VistaChefs(Resource):
    """
    Vista para manejar la colección de chefs.
    Permite listar todos los chefs y crear uno nuevo.
    """

    @jwt_required()
    def get(self):
        """
        Obtiene todos los chefs.
        - Requiere autenticación JWT.
        - Retorna una lista de chefs serializados en JSON.
        """
        chefs = Chef.query.all()  # Consulta todos los chefs en la base de datos
        return [chef_schema.dump(chef) for chef in chefs]  # Serializa cada chef

    @jwt_required()
    def post(self):
        """
        Crea un nuevo chef.
        - Requiere autenticación JWT.
        - Recibe los datos en JSON en el cuerpo de la solicitud.
        - Retorna el chef creado con código HTTP 201.
        """
        nuevo_chef = Chef(
            nombre=request.json["nombre"],
            telefono=request.json["telefono"],
            correo=request.json["correo"],
            especialidad=request.json["especialidad"]
        )
        db.session.add(nuevo_chef)  # Agrega el chef a la sesión de la base de datos
        db.session.commit()  # Guarda los cambios en la base de datos
        return chef_schema.dump(nuevo_chef), 201  # Retorna el chef serializado


class VistaReporteHistorialPrecios(Resource):
    
    @jwt_required()
    def get(self):
        """
        Obtiene todos los registros del historial.
        - Requiere autenticación JWT.
        - Retorna una lista de historiales de cambios de precios serializados en JSON.
        """
        historiales = IngredienteProveedorHistorial.query.all()
        schema = IngredienteProveedorHistorialSchema(many=True)
        result = schema.dump(historiales)
        return result, 200
class IngredienteReporte:
    def __init__(self, nombre, cantidad_unitaria, cantidad_total, proveedor, precio_unitario, costo_total):
        self.nombre = nombre
        self.cantidad_unitaria = cantidad_unitaria
        self.cantidad_total = cantidad_total
        self.proveedor = proveedor
        self.precio_unitario = precio_unitario
        self.costo_total = costo_total

    def to_dict(self):
        return {
            "nombre": self.nombre,
            "cantidad_unitaria": self.cantidad_unitaria,
            "cantidad_total": self.cantidad_total,
            "proveedor": self.proveedor,
            "precio_unitario": self.precio_unitario,
            "costo_total": self.costo_total
        }

class VistaReporteCompra(Resource):
    @jwt_required()

    def get(self, id_menu, id_restaurante):
        menu = self._obtener_menu(id_menu)
        reporte_compra = self._generar_reporte(menu)
        return reporte_compra, 200

    def _obtener_menu(self, id_menu):
        return (
            Menu.query
            .options(
                joinedload(Menu.recetas)
                .joinedload(RecetaMenu.receta)
                .joinedload(Receta.ingredientes)
                .joinedload(RecetaIngrediente.ingrediente_ref)
                .joinedload(Ingrediente.proveedores)
                .load_only('id', 'precio')
                .joinedload(IngredienteProveedor.proveedor)
                .load_only('id', 'nombre')
            )
            .get_or_404(id_menu)
        )

    def _generar_reporte(self, menu):
        reporte = {"recetas": [], "total": 0.0}
        for receta_menu in menu.recetas:
            receta_dict, total_receta = self._procesar_receta(receta_menu)
            reporte["recetas"].append(receta_dict)
            reporte["total"] += total_receta
        reporte["total"] = round(reporte["total"], 2)
        return reporte


    def _procesar_receta(self, receta_menu):
        receta = receta_menu.receta
        cantidad_recetas = receta_menu.personas

        receta_dict = {
            "nombre": receta.nombre,
            "cantidad_recetas": cantidad_recetas,
            "ingredientes": []
        }

        total_receta = 0.0
        for receta_ingrediente in receta.ingredientes:
            ingrediente_reporte, costo_total = self._procesar_ingrediente(receta_ingrediente, cantidad_recetas)
            receta_dict["ingredientes"].append(ingrediente_reporte.to_dict())
            total_receta += costo_total


        return receta_dict, total_receta

    def _procesar_ingrediente(self, receta_ingrediente, cantidad_recetas):
        ingrediente = receta_ingrediente.ingrediente_ref  
        proveedores = [p for p in ingrediente.proveedores if p.proveedor is not None]

        if proveedores:
            proveedor_economico = min(proveedores, key=lambda x: float(x.precio or 0))
            proveedor_nombre = proveedor_economico.proveedor.nombre
            precio_unitario = float(proveedor_economico.precio or 0)
        else:
            proveedor_nombre = None
            precio_unitario = 0.0

        cantidad_total = float(receta_ingrediente.cantidad or 0) * cantidad_recetas
        costo_total = round(cantidad_total * precio_unitario, 2)

        ingrediente_reporte = IngredienteReporte(
            ingrediente.nombre,
            float(receta_ingrediente.cantidad or 0),
            cantidad_total,
            proveedor_nombre,
            precio_unitario,
            costo_total
        )

        return ingrediente_reporte, costo_total


class VistaReporteIngredienteProveedor(Resource):
    
    @jwt_required()
    def get(self):
        """
        Obtiene todos los registros
        - Requiere autenticación JWT.
        - Retorna una lista de .
        """
        ingredientesProveedores = IngredienteProveedor.query.all()
        schema = IngredienteProveedorSchema(many=True)
        result = schema.dump(ingredientesProveedores)
        return result, 200

class VistaRestauranteChefs(Resource):
    """
    Administra la relación muchos-a-muchos entre Restaurante y Chef.
    - GET: Lista los chefs del restaurante.
    - PUT: Reemplaza COMPLETAMENTE la lista de chefs del restaurante.
    """

    @jwt_required()
    def get(self, id_restaurante):
        """Lista los chefs asociados a un restaurante."""
        restaurante = Restaurante.query.get_or_404(id_restaurante)
        return ChefSchema(many=True).dump(restaurante.chefs), 200

    @jwt_required()
    def put(self, id_restaurante):
        """
        Reemplaza COMPLETAMENTE la lista de chefs de un restaurante.
        Body (JSON o form-data con 'chef_ids'): { "chef_ids": [1,2,3] }
        """
        restaurante = Restaurante.query.get_or_404(id_restaurante)

        # Acepta JSON o form-data
        data = request.get_json(silent=True) or request.form.to_dict()
        raw_ids = data.get("chef_ids")
        if raw_ids is None:
            return {"mensaje": "Debe enviar 'chef_ids'."}, 400

        # Parsear si viene como string (form-data)
        if isinstance(raw_ids, str):
            try:
                import json as _json
                raw_ids = _json.loads(raw_ids)
            except Exception:
                return {"mensaje": "El campo 'chef_ids' debe ser JSON válido (lista)."}, 400

        if not isinstance(raw_ids, list):
            return {"mensaje": "El campo 'chef_ids' debe ser una lista."}, 400

        try:
            nuevos_ids = {int(cid) for cid in raw_ids}
        except Exception:
            return {"mensaje": "Todos los valores de 'chef_ids' deben ser enteros."}, 400

        # Validar existencia de todos
        chefs = Chef.query.filter(Chef.id.in_(nuevos_ids)).all() if nuevos_ids else []
        if len(chefs) != len(nuevos_ids):
            encontrados = {c.id for c in chefs}
            faltantes = sorted(list(nuevos_ids - encontrados))
            return {"mensaje": f"Chefs no encontrados: {faltantes}"}, 404

        # Reemplazar lista completa
        restaurante.chefs = chefs
        db.session.commit()

        return {
            "mensaje": "Chefs actualizados",
            "chefs": ChefSchema(many=True).dump(restaurante.chefs)
        }, 200
    

class VistaAsignarReceta(Resource):
    """
    POST /restaurantes/<id_restaurante>/recetas-asignadas
      Body: { "receta_id": 10 }
    DELETE /restaurantes/<id_restaurante>/recetas-asignadas/<id_receta>
    """

    @jwt_required()
    def post(self, id_restaurante):
        data = request.get_json(force=True, silent=True) or {}
        receta_id = data.get("receta_id")

        if not receta_id:
            return {"mensaje": "Debe enviar 'receta_id'."}, 400

        # normalizamos a int por si vienen como string
        id_restaurante = int(id_restaurante)
        receta_id = int(receta_id)

        # validaciones de existencia
        Restaurante.query.get_or_404(id_restaurante)
        Receta.query.get_or_404(receta_id)

        # evitar duplicados
        existente = RestauranteReceta.query.filter_by(
            restaurante_id=id_restaurante,
            receta_id=receta_id
        ).first()
        if existente:
            return {"mensaje": "La receta ya está asignada a este restaurante."}, 400

        asignacion = RestauranteReceta(
            restaurante_id=id_restaurante,
            receta_id=receta_id
        )
        db.session.add(asignacion)
        db.session.commit()

        return {
            "mensaje": "Receta asignada exitosamente",
            "asignacion": restaurante_receta_schema.dump(asignacion)
        }, 201

    @jwt_required()
    def delete(self, id_restaurante, id_receta):
        # normalizamos a int
        id_restaurante = int(id_restaurante)
        id_receta = int(id_receta)

        # buscamos SOLO la relación
        asignacion = RestauranteReceta.query.filter_by(
            restaurante_id=id_restaurante,
            receta_id=id_receta
        ).first()

        if not asignacion:
            return {"mensaje": "La receta no está asignada a este restaurante."}, 404

        # eliminamos la fila de la tabla puente (NO la receta)
        db.session.delete(asignacion)
        db.session.commit()

        # 204 = sin contenido
        return '', 204
