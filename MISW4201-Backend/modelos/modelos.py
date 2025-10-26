from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from marshmallow import fields, Schema
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

db = SQLAlchemy()

class Ingrediente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(128))

    proveedores = db.relationship('IngredienteProveedor', backref='ingrediente_ref')

class Restaurante(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(128))
    direccion = db.Column(db.String(128))
    telefono = db.Column(db.String(128))
    horario_atencion = db.Column(db.String(128)) 
    tipo_comida = db.Column(db.String(128))  

    chefs = db.relationship(
        "Chef",
        secondary="restaurante_chef",
        back_populates="restaurantes",
        lazy="selectin",
    )
    
    foto_url = db.Column(db.String(256))
    
class RecetaIngrediente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cantidad = db.Column(db.Numeric)
    ingrediente = db.Column(db.Integer, db.ForeignKey('ingrediente.id'))
    receta = db.Column(db.Integer, db.ForeignKey('receta.id'))
    ingrediente_ref = db.relationship("Ingrediente", backref="recetas_ingredientes")

class Receta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(128))
    duracion = db.Column(db.Numeric)
    preparacion = db.Column(db.String)
    ingredientes = db.relationship('RecetaIngrediente', cascade='all, delete, delete-orphan')
    usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'))

class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(50))
    contrasena = db.Column(db.String(50))
    tipo = db.Column(db.String(50))

    __mapper_args__ = {
        "polymorphic_identity": "usuario",
        "polymorphic_on": tipo
    }

    recetas = db.relationship('Receta', cascade='all, delete, delete-orphan')


class Chef(Usuario):
    __tablename__ = "chef"
    id = db.Column(db.Integer, db.ForeignKey("usuario.id"), primary_key=True)

    nombre = db.Column(db.String(128), nullable=False)
    telefono = db.Column(db.String(128))
    correo = db.Column(db.String(128))
    especialidad = db.Column(db.String(128))

    __mapper_args__ = {
        "polymorphic_identity": "chef",
    }

    restaurantes = db.relationship(
        "Restaurante",
        secondary="restaurante_chef",
        back_populates="chefs",
        lazy="selectin",
    )

class Admin(Usuario):
    __mapper_args__ = {
        "polymorphic_identity": "admin",
    }


class Menu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(128))
    fechainicio = db.Column(db.Date)
    fechafin = db.Column(db.Date)
    descripcion = db.Column(db.String(256))

    foto_url = db.Column(db.String(256))

    restaurante_id = db.Column(db.Integer, db.ForeignKey("restaurante.id"), nullable=False)
    restaurante = db.relationship("Restaurante")

    autor_id = db.Column(db.Integer, db.ForeignKey("usuario.id"))
    autor = db.relationship("Usuario")

    recetas = db.relationship("RecetaMenu", cascade="all, delete, delete-orphan")


class RecetaMenu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    personas = db.Column(db.Integer)

    receta_id = db.Column(db.Integer, db.ForeignKey("receta.id"))
    receta = db.relationship("Receta")

    menu_id = db.Column(db.Integer, db.ForeignKey("menu.id"))



# ============================
# ESQUEMAS
# ============================

class IngredienteProveedor(db.Model):
    """
    Modelo de relación entre Ingrediente y Proveedor.
    Representa el precio de un ingrediente específico para un proveedor dado.
    """
    
    id = db.Column(db.Integer, primary_key=True)              # ID único de la relación
    ingrediente_id = db.Column(db.Integer, db.ForeignKey('ingrediente.id',ondelete='CASCADE'),nullable=False)  # FK al ingrediente
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedor.id',ondelete='CASCADE'),nullable=False)     # FK al proveedor
    precio = db.Column(db.Numeric)  
    cantidad = db.Column(db.Integer)                            # Cantidad del ingrediente para este proveedor
    fecha = db.Column(db.Date)                                   # Fecha de la relación
    elegido = db.Column(db.Boolean, default=False)
    ingrediente = db.relationship('Ingrediente') 
    proveedor = db.relationship('Proveedor', back_populates='ingredientes')   
    
    # Relación con el historial
    historial = db.relationship(
                    'IngredienteProveedorHistorial',
                    cascade='all, delete-orphan',
                    back_populates='ingrediente_proveedor',
                    order_by='IngredienteProveedorHistorial.fecha',
                    passive_deletes=False 
                )

class IngredienteProveedorHistorial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ingrediente_proveedor_id = db.Column(db.Integer, db.ForeignKey('ingrediente_proveedor.id',ondelete='CASCADE'), nullable=False)
    precio = db.Column(db.Numeric)
    fecha = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    ingrediente_proveedor = db.relationship(
        'IngredienteProveedor',
        back_populates='historial',
        passive_deletes=True
    )
    
class Proveedor(db.Model):
    """
    Modelo de Proveedor.
    Representa un proveedor de ingredientes o productos dentro del sistema.
    """
    id = db.Column(db.Integer, primary_key=True)       # ID único del proveedor
    nombre = db.Column(db.String(128))                # Nombre del proveedor
    cedula = db.Column(db.Integer())                 # Cédula o documento de identidad
    telefono = db.Column(db.String(128))              # Teléfono de contacto
    correo = db.Column(db.String(128))                # Correo electrónico
    direccion = db.Column(db.String(256))             # Dirección física
    calificacion = db.Column(db.Integer())            # Calificación del proveedor (1 a 5, por ejemplo)
    ingredientes = db.relationship(
                                'IngredienteProveedor',
                                cascade='all, delete-orphan',
                                back_populates='proveedor',
                                passive_deletes=False
                            )
    
    @property
    def ingrediente_obj(self):
        return Ingrediente.query.get(self.ingrediente_id)

class RestauranteChef(db.Model):
    __tablename__ = "restaurante_chef"

    id = db.Column(db.Integer, primary_key=True)
    chef_id = db.Column(db.Integer, db.ForeignKey("chef.id", ondelete="CASCADE"), nullable=False)
    restaurante_id = db.Column(db.Integer, db.ForeignKey("restaurante.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("chef_id", "restaurante_id", name="uq_restaurante_chef"),
    )

class RestauranteReceta(db.Model):
    __tablename__ = "restaurante_receta"

    id = db.Column(db.Integer, primary_key=True)
    restaurante_id = db.Column(db.Integer, db.ForeignKey("restaurante.id", ondelete="CASCADE"), nullable=False)
    receta_id = db.Column(db.Integer, db.ForeignKey("receta.id", ondelete="CASCADE"), nullable=False)
    __table_args__ = (
        db.UniqueConstraint("restaurante_id", "receta_id", name="uq_restaurante_receta"),
    )
    restaurante = db.relationship("Restaurante")
    receta = db.relationship("Receta")

class IngredienteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Ingrediente
        include_relationships = True
        load_instance = True

    id = fields.String()   
    nombre = fields.String()

    proveedores = fields.List(fields.Nested(
        'IngredienteProveedorSchema',
        only=('precio', 'proveedor', 'cantidad')
    ))

class RecetaIngredienteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = RecetaIngrediente
        include_relationships = True
        include_fk = True
        load_instance = True
        
    id = fields.String()
    cantidad = fields.String()
    ingrediente = fields.String()


class RecetaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Receta
        include_relationships = True
        include_fk = True
        load_instance = True
        
    id = fields.String()
    duracion = fields.String()
    ingredientes = fields.List(fields.Nested(RecetaIngredienteSchema()))
    
class RestauranteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Restaurante
        include_relationships = True
        include_fk = True
        load_instance = True
        
    id = fields.String()
    nombre = fields.String()
    direccion = fields.String()
    telefono = fields.String()
    horario_atencion = fields.String()
    tipo_comida = fields.String()

    chefs = fields.List(fields.Nested(
        "ChefSchema",
        only=("id", "nombre", "especialidad", "telefono", "correo")
    ))

class UsuarioSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Usuario
        include_relationships = True
        load_instance = True
        
    id = fields.String()

class RecetaMenuSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = RecetaMenu
        include_relationships = True
        include_fk = True
        load_instance = True

    id = fields.String()
    personas = fields.Integer()
    receta = fields.Nested("RecetaSchema", exclude=("ingredientes",))


class MenuSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Menu
        include_relationships = True
        include_fk = True
        load_instance = True

    id = fields.String()
    nombre = fields.String()
    fechainicio = fields.Date()
    fechafin = fields.Date()
    descripcion = fields.String()
    foto_url = fields.String()
    autor = fields.Nested("UsuarioSchema", only=("id", "usuario"))
    recetas = fields.List(fields.Nested(RecetaMenuSchema()))
    restaurante = fields.Nested("RestauranteSchema", only=("id", "nombre"))

    
class UsuarioSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Usuario
        include_relationships = True
        load_instance = True

    id = fields.String()
    tipo = fields.String()


class ChefSchema(UsuarioSchema):
    class Meta(UsuarioSchema.Meta):
        model = Chef
        include_relationships = True
        load_instance = True

    # Campos propios de Chef
    nombre = fields.String()
    telefono = fields.String()
    correo = fields.String()
    especialidad = fields.String()

    restaurantes = fields.List(fields.Nested(
        "RestauranteSchema",
        only=("id", "nombre", "direccion", "telefono", "horario_atencion", "tipo_comida")
    ))

class AdminSchema(UsuarioSchema):
    class Meta(UsuarioSchema.Meta):
        model = Admin

class IngredienteProveedorSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = IngredienteProveedor  
        include_relationships = True
        include_fk = True
        load_instance = True

    id = fields.Integer()
    precio = fields.Float()
    cantidad = fields.Integer()
    fecha = fields.Date()

    proveedor = fields.Nested('ProveedorSchema', only=('id', 'nombre', 'telefono', 'correo', 'direccion', 'calificacion'))
    ingrediente = fields.Nested('IngredienteSchema', only=('id', 'nombre'))

class IngredienteProveedorHistorialSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = IngredienteProveedorHistorial
        include_fk = True         
        include_relationships = True
        load_instance = True

    id = fields.String()
    precio = fields.String()
    fecha = fields.String()

    ingrediente_proveedor = fields.Nested(
    'IngredienteProveedorSchema',
    only=('ingrediente','proveedor','id','precio','fecha')  
)

class ProveedorSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Proveedor
        include_relationships = True
        load_instance = True

    id = fields.String()           
    nombre = fields.String()       
    telefono = fields.String()     
    correo = fields.String()       
    direccion = fields.String()    
    calificacion = fields.String() 

    ingredientes = fields.List(fields.Nested(
        'IngredienteProveedorSchema',
        only=('precio', 'ingrediente', 'cantidad')
    ))

class RestauranteChefSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = RestauranteChef
        include_fk = True
        load_instance = True

    id = fields.Integer()
    chef_id = fields.Integer()
    restaurante_id = fields.Integer()


class RestauranteRecetaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = RestauranteReceta
        include_relationships = True
        include_fk = True
        load_instance = True

    id = fields.Integer()
    restaurante_id = fields.Integer()
    receta_id = fields.Integer()

    # metadata útil para mostrar en el front
    receta = fields.Nested("RecetaSchema", only=("id", "nombre", "duracion"))
