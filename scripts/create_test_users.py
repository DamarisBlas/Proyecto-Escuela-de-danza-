import requests
import json
import time

BASE_URL = 'http://localhost:5000/users/create'

# Lista de 40 alumnas con email/celular únicos según lo proveído
USERS = [
    {"nombre": "Andrea", "apellido": "Flores", "email": "andrea.flores@example.com", "celular": "+59169851234"},
    {"nombre": "Mariana", "apellido": "Rojas", "email": "mariana.rojas@example.com", "celular": "+59175246810"},
    {"nombre": "Valeria", "apellido": "Guzmán", "email": "valeria.guzman@example.com", "celular": "+59168014257"},
    {"nombre": "Fernanda", "apellido": "Vargas", "email": "fernanda.vargas@example.com", "celular": "+59172095431"},
    {"nombre": "Sofía", "apellido": "Aramayo", "email": "sofia.aramayo@example.com", "celular": "+59177863210"},
    {"nombre": "Paola", "apellido": "Quiroga", "email": "paola.quiroga@example.com", "celular": "+59165328147"},
    {"nombre": "Camila", "apellido": "Mendoza", "email": "camila.mendoza@example.com", "celular": "+59176493012"},
    {"nombre": "Julieta", "apellido": "Salinas", "email": "julieta.salinas@example.com", "celular": "+59169915420"},
    {"nombre": "Daniela", "apellido": "Gutiérrez", "email": "daniela.gutierrez@example.com", "celular": "+59171532048"},
    {"nombre": "Natalia", "apellido": "Paredes", "email": "natalia.paredes@example.com", "celular": "+59168174203"},
    {"nombre": "Micaela", "apellido": "Muñoz", "email": "micaela.munoz@example.com", "celular": "+59178905321"},
    {"nombre": "Adriana", "apellido": "Céspedes", "email": "adriana.cespedes@example.com", "celular": "+59169821450"},
    {"nombre": "Claudia", "apellido": "Romero", "email": "claudia.romero@example.com", "celular": "+59174321089"},
    {"nombre": "Patricia", "apellido": "Aguilar", "email": "patricia.aguilar@example.com", "celular": "+59169180542"},
    {"nombre": "Evelyn", "apellido": "López", "email": "evelyn.lopez@example.com", "celular": "+59177038214"},
    {"nombre": "Brenda", "apellido": "Arce", "email": "brenda.arce@example.com", "celular": "+59178801453"},
    {"nombre": "Michelle", "apellido": "Aliaga", "email": "michelle.aliaga@example.com", "celular": "+59168052941"},
    {"nombre": "Alejandra", "apellido": "Villarroel", "email": "alejandra.villarroel@example.com", "celular": "+59172146830"},
    {"nombre": "Fabiana", "apellido": "Cornejo", "email": "fabiana.cornejo@example.com", "celular": "+59169087321"},
    {"nombre": "Ana Paula", "apellido": "Salvatierra", "email": "ana.salvatierra@example.com", "celular": "+59175392014"},
    {"nombre": "Karina", "apellido": "Pinto", "email": "karina.pinto@example.com", "celular": "+59178962145"},
    {"nombre": "Dayana", "apellido": "Velasco", "email": "dayana.velasco@example.com", "celular": "+59169920314"},
    {"nombre": "Tatiana", "apellido": "Barrientos", "email": "tatiana.barrientos@example.com", "celular": "+59172514809"},
    {"nombre": "Luciana", "apellido": "Céspedes", "email": "luciana.cespedes@example.com", "celular": "+59178120453"},
    {"nombre": "Constanza", "apellido": "Fuentes", "email": "constanza.fuentes@example.com", "celular": "+59173415982"},
    {"nombre": "Nicole", "apellido": "Padilla", "email": "nicole.padilla@example.com", "celular": "+59169847102"},
    {"nombre": "Bianca", "apellido": "Herrera", "email": "bianca.herrera@example.com", "celular": "+59171503829"},
    {"nombre": "Marcela", "apellido": "Rocha", "email": "marcela.rocha@example.com", "celular": "+59178063512"},
    {"nombre": "Jimena", "apellido": "Vargas", "email": "jimena.vargas@example.com", "celular": "+59169924130"},
    {"nombre": "Renata", "apellido": "Castellón", "email": "renata.castellon@example.com", "celular": "+59176789015"},
    {"nombre": "Juliana", "apellido": "Molina", "email": "juliana.molina@example.com", "celular": "+59169047215"},
    {"nombre": "Gabriela", "apellido": "Ríos", "email": "gabriela.rios@example.com", "celular": "+59178941250"},
    {"nombre": "Fátima", "apellido": "Cardozo", "email": "fatima.cardozo@example.com", "celular": "+59175401263"},
    {"nombre": "Karen", "apellido": "Montaño", "email": "karen.montano@example.com", "celular": "+59169173028"},
    {"nombre": "Lorena", "apellido": "Sevilla", "email": "lorena.sevilla@example.com", "celular": "+59171850942"},
    {"nombre": "Viviana", "apellido": "Cabrera", "email": "viviana.cabrera@example.com", "celular": "+59168275140"},
    {"nombre": "Daniela", "apellido": "Camacho", "email": "daniela.camacho@example.com", "celular": "+59178934210"},
    {"nombre": "Nicole", "apellido": "Durán", "email": "nicole.duran@example.com", "celular": "+59172089341"},
    {"nombre": "Paola", "apellido": "Soliz", "email": "paola.soliz@example.com", "celular": "+59178302194"},
    {"nombre": "Samantha", "apellido": "Flores", "email": "samantha.flores@example.com", "celular": "+59169951802"}
]

# Password for all test users
DEFAULT_PASSWORD = 'test123'

HEADERS = {'Content-Type': 'application/json'}


def create_user(u):
    payload = {
        'nombre': u['nombre'],
        'apellido': u['apellido'],
        'email': u['email'],
        'password': DEFAULT_PASSWORD,
        'celular': u['celular'],
        # aseguramos tipo_cuenta y temporal desde creación
        'tipo_cuenta': 'alumno',
        'temporal': False
    }

    resp = requests.post(BASE_URL, json=payload, headers=HEADERS)
    return resp


def main():
    created = 0
    errors = []

    for i, u in enumerate(USERS, start=1):
        print(f"{i:02d}. Creando usuario: {u['nombre']} {u['apellido']} - {u['email']}")
        try:
            r = create_user(u)
            if r.status_code in (200, 201):
                print(f"   ✅ OK {r.status_code} -> {r.text}")
                created += 1
            else:
                print(f"   ⚠️ Error {r.status_code} -> {r.text}")
                errors.append({'user': u, 'status': r.status_code, 'body': r.text})
        except Exception as ex:
            print(f"   ❌ Exception -> {str(ex)}")
            errors.append({'user': u, 'exception': str(ex)})

        # pequeño delay para evitar rate-limits
        time.sleep(0.25)

    print('\n---')
    print(f'Usuarios procesados: {len(USERS)}')
    print(f'Usuarios creados: {created}')
    print(f'Errores: {len(errors)}')
    if errors:
        print(json.dumps(errors, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
