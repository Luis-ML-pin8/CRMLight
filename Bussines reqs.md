A) Objetivo
Disponer de un CRM que permita coordinar a un equipo de ventas que desarrolla su labor fuera de las instalaciones de la empresa

B) Actores
Hay 3 roles implicados en esta solucion:
- Administrator: No tiene funciones comerciales pero es el responsable del lanzamiento y mantenimiento de la plataforma y la aplicación. Podria realizar algunas labores coordinadoras pero son excepciones para cubrir problemas
- Coordinator: Tiene a su cargo un equipo de agentes (Dashboard), marca los objetivos, asigna carteras y ayuda al equipo en su labor comercial con una función de controler
- Agent: Se encarga puramente de la relación con el cliente, tiene asignada una cartera, unos objetivos y a partir de ellos desarrolla su labor

Los roles Coordinator y Agent pueden converger en algunos usuarios (Coordinadores con cartera propia), por ello la herramienta deberá exigir que cada Agent tenga asignado un Coordinator, puediendo ser el mismo siempre que tenga ambos roles asignados

C) Entorno técnico
Los Agents y Coordinator dispondrán de una tablet que sserá su interface principal con el sistema, tambien podrán usar un navegador ordinario de escritorio cuando estén en la oficina

La estructura de la aplicacion debe ser en 3 capas:
- Persistencia: Sobre una BBDD SQLite desarrollaremos una clase PersistenceLayer que encapsulará todos los detalles de normalización, implementacion relacional, etc. Hacie fuera de PersistenceLayer no hay tablas ni nada similar, solo unas clases logicas muy afiines a las necesidades de la capa cliente sin detalle internos. Esta filosofia la haremos extensiva a todos el proyecto con una estructura de 'cebollas que se comunican con cebollas' para mantener los contextos lo mas pequeños posible y la encapsulacion como guia primordial
- Logica y negocio: Usando las clases logicas, implementaremos la reglas de negocio necesarias para cumplir lo que no va a pedir la capa de presentacion
- Presentación: Es la interface que ven los usuarios en su navegador web. Aqui no debe haber rastro de detalles tecnicos del problema porque deberian de haber quedado resueltos en las otras capas interiores, aqui nuestros objetivo es usabilidad y cubrir las necesidades del usuario, sea cual sea su rol

Esta vision nos lleva hacia una interface React para maximizar la obtención de los objetivo de la capa de presentación. Inicialmente usaremos una BBDD SQLite, aunque si hacemos bien en el encapsulamiento, la migración a otro motor deberia de ser simple. Y por ultimo el core de la aplicacion será un motor de reglaas de negocio expuesto por una api de consumo, inicialmente local, que deberña de proveer a la capa de presentación de todo lo que necesita. Aqui las alternativas ya son varias, y al igual que en la capa de persistencia, si encapsulamos bien, la migracion del motoro logico deberia de ser un problema como poco, acotado. Inicialmente usaremos la misma tecnologia que usaremos para la PersistenceLayer, aunque su destino final deberia de ser un lenguaje compilado y rápido (c#, go o rust)

D) Capacidades del sistema
Además de la gestión coordinada de las entidades propias de un CRM (Clientes, contactos, oportunidades, etc.), deberemos de hacer foco en otra serie de requerimientos mas de la plataforma, como la capacidad de enviar correos electronicos en nombre del Agent (Esta capacidad está incorporada en O365 y pareceria la opcion mas viable. Nos va a obligar a autenticar OAuth en Microsoft para registrar al buzon emisor 'usurpador')

Deberemos de permitir exportar las tablas de datos a excel, para permitir tratamientos privados de datos, que no estuviesen aun incluidos en la aplicación

Inicio de sesion de los usuarios con mecanismo de doble autenticacion, certificado de cliente o algún otro modo de blindar los accesos indeseables

Generación de informes y otro tipo de documentos en PDF

Incorporación de un micro-almacén documental en cada entidad, que nos permita arrastrarle ficheros y que los guarde y mantenga vinculados con esa entidad (PDFs, correos msg o eml, Excel, Word, Imagenes, etc.). Además de la obvia información de auditoria estandard, estos documentos pueden contener un breve comentario de su naturaleza

Deberemos de dar capacidades IA a nuestra apliciación para tareas como deepsearch sobre empresas y contactos, con el fin de elaborar informes de datos publicos (LinkedIn, medios de comunicación, portales con datos financieros y noticias del ambito empresarial de cada pais, etc.) sin tener que perder horas de navegación. Tambien es posible que con el tiempo, aparezcan otros usos de la IA dentro de la aplicación, por lo que no deberia de ser solo una api key y un modelo, serán agentes IA orientados que podremos crear en la pantalla del rol Administrator. Empezaremos con el agente 'Detective privado' que será el encargado de elaborar los informes, esta caracterización de rol IA se hará con el prompt de definición del agente