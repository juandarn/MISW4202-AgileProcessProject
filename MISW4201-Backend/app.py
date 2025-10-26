from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_restful import Api

from modelos import db
from vistas import \
    VistaIngrediente, VistaIngredientes, \
    VistaReceta, VistaRecetas, \
    VistaSignIn, VistaLogIn, \
    VistaRestauranteChefs
from vistas.vistas import AdminResource, VistaAsignarReceta, VistaChef, VistaChefs, VistaMenu, VistaMenus, VistaProveedor, VistaProveedores,VistaReporteHistorialPrecios,VistaReporteIngredienteProveedor,VistaRestaurantes,VistaRestaurante,VistaReporteCompra,VistaPerfil

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dbapp.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'frase-secreta'
app.config['PROPAGATE_EXCEPTIONS'] = True

app_context = app.app_context()
app_context.push()

db.init_app(app)
db.create_all()

cors = CORS(app)

api = Api(app)
api.add_resource(AdminResource, '/admin')
api.add_resource(VistaPerfil, '/perfil/<int:id_usuario>')
api.add_resource(VistaSignIn, '/signin')
api.add_resource(VistaLogIn, '/login')
api.add_resource(VistaIngredientes, '/ingredientes')
api.add_resource(VistaIngrediente, '/ingrediente/<int:id_ingrediente>')
# Recetas por restaurante
api.add_resource(VistaRecetas, '/restaurantes/<int:id_restaurante>/recetas')
api.add_resource(VistaReceta, '/restaurantes/<int:id_restaurante>/receta/<int:id_receta>')
api.add_resource(VistaMenus, '/restaurantes/<int:id_restaurante>/menus')
api.add_resource(VistaMenu, '/restaurantes/<int:id_restaurante>/menu/<int:id_menu>')
api.add_resource(VistaReporteCompra, '/restaurantes/<int:id_restaurante>/reporte-compra/<int:id_menu>')
api.add_resource(VistaProveedores, '/proveedores')
api.add_resource(VistaProveedor, '/proveedor/<int:id_proveedor>')
api.add_resource(VistaChefs, '/chefs')
api.add_resource(VistaChef, '/chef/<int:id_chef>')
api.add_resource(VistaReporteHistorialPrecios, '/reporte-historial-precios')
api.add_resource(VistaReporteIngredienteProveedor, '/reporte-ingrediente-proveedor')
api.add_resource(VistaRestaurantes, '/restaurantes')
api.add_resource(VistaRestaurante, '/restaurante/<int:id_restaurante>')
api.add_resource(VistaRestauranteChefs, '/restaurantes/<int:id_restaurante>/chefs')
api.add_resource(VistaAsignarReceta, "/restaurantes/<int:id_restaurante>/recetas-asignadas")


jwt = JWTManager(app)


if __name__ == "__main__":
    app.run(debug=True, port=5000)