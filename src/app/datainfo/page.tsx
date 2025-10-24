export default function DataInfoPage() {
  const entityStyle =
    'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden';
  const strongEntityTitleStyle = 'p-3 bg-gray-100 border-b border-gray-200 text-lg font-semibold text-gray-700';
  const weakEntityTitleStyle = 'p-3 bg-gray-100 border-b border-gray-200 text-lg text-gray-700';

  const fieldListStyle = 'p-4 space-y-2';
  const fieldStyle = 'flex justify-between items-center text-sm';
  const fieldNameStyle = 'text-gray-600';
  const fieldTypeStyle = 'font-mono text-blue-600';
  const pkBadge = 'bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full';
  const fkBadge = 'bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full';
  const relationSectionStyle = 'mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg';
  const relationTitleStyle = 'text-xl font-bold text-blue-800 mb-2';
  const relationTextStyle = 'text-blue-700';

  return (
    <main className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Diagrama de Entidad-Relación
      </h1>
      <p className="text-lg text-gray-500 mb-10">
        Representación visual del modelo de datos físico de la aplicación.
      </p>

      {/* Sección de Usuarios y Roles */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Usuarios y Roles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={entityStyle}>
            <h3 className={strongEntityTitleStyle}>User</h3>
            <ul className={fieldListStyle}>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>id</span>
                <span className={pkBadge}>PK</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>nombre</span>
                <span className={fieldTypeStyle}>string</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>apellidos</span>
                <span className={fieldTypeStyle}>string</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>email</span>
                <span className={fieldTypeStyle}>string</span>
              </li>
               <li className={fieldStyle}>
                <span className={fieldNameStyle}>movil</span>
                <span className={fieldTypeStyle}>string</span>
              </li>
               <li className={fieldStyle}>
                <span className={fieldNameStyle}>usuario</span>
                <span className={fieldTypeStyle}>string</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>isAdministrator</span>
                <span className={fieldTypeStyle}>boolean</span>
              </li>
            </ul>
          </div>
          <div className={entityStyle}>
            <h3 className={strongEntityTitleStyle}>Coordinator</h3>
            <ul className={fieldListStyle}>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>id</span>
                <span className={pkBadge}>PK</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>idUser</span>
                <span className={fkBadge}>FK (User)</span>
              </li>
            </ul>
          </div>
          <div className={entityStyle}>
            <h3 className={strongEntityTitleStyle}>Agent</h3>
            <ul className={fieldListStyle}>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>id</span>
                <span className={pkBadge}>PK</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>idUser</span>
                <span className={fkBadge}>FK (User)</span>
              </li>
              <li className={fieldStyle}>
                <span className={fieldNameStyle}>idCoordinator</span>
                <span className={fkBadge}>FK (Coordinator)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className={relationSectionStyle}>
          <h4 className={relationTitleStyle}>Relaciones de Usuario:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li className={relationTextStyle}>
              Un `User` puede tener el rol de `Coordinator` (Relación 1 a 1).
            </li>
            <li className={relationTextStyle}>
              Un `User` puede tener el rol de `Agent` (Relación 1 a 1).
            </li>
             <li className={relationTextStyle}>
              Un `Agent` puede tener un `Coordinator` (Relación N a 1).
            </li>
             <li className={relationTextStyle}>
              Un `User` con `isAdministrator=true` tiene privilegios de administrador.
            </li>
             <li className={relationTextStyle}>
              En una implementación SQL, las columnas `Agent.idUser` y `Coordinator.idUser` deberían tener un índice `UNIQUE` para garantizar que un usuario solo pueda tener cada rol una vez.
            </li>
          </ul>
        </div>
      </section>

      {/* Sección de Clientes y Ventas */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Clientes y Ventas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Account */}
            <div className={entityStyle}>
                <h3 className={strongEntityTitleStyle}>Account</h3>
                <ul className={fieldListStyle}>
                <li className={fieldStyle}>
                    <span className={fieldNameStyle}>id</span>
                    <span className={pkBadge}>PK</span>
                </li>
                <li className={fieldStyle}>
                    <span className={fieldNameStyle}>nombre</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>cifnif</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>direccion</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>poblacion</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                <li className={fieldStyle}>
                    <span className={fieldNameStyle}>provincia</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                <li className={fieldStyle}>
                    <span className={fieldNameStyle}>cp</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                <li className={fieldStyle}>
                    <span className={fieldNameStyle}>pais</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>telefono</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>email</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                 <li className={fieldStyle}>
                    <span className={fieldNameStyle}>website</span>
                    <span className={fieldTypeStyle}>string</span>
                </li>
                </ul>
            </div>
            
             {/* Contact */}
            <div className={entityStyle}>
                <h3 className={weakEntityTitleStyle}>Contact</h3>
                <ul className={fieldListStyle}>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>id</span>
                        <span className={pkBadge}>PK</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idAccount</span>
                        <span className={fkBadge}>FK (Account)</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>nombre</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>apellidos</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>email</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>telefono</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>cargo</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                </ul>
            </div>


            {/* Portfolio (Tabla de Unión) */}
            <div className={`${entityStyle} border-indigo-300`}>
                <h3 className={`${weakEntityTitleStyle} bg-indigo-100/50 text-indigo-800`}>Portfolio (Cartera)</h3>
                <ul className={fieldListStyle}>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>id</span>
                        <span className={pkBadge}>PK</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idAgent</span>
                        <span className={fkBadge}>FK (Agent)</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idAccount</span>
                        <span className={fkBadge}>FK (Account)</span>
                    </li>
                </ul>
            </div>
            
            {/* Opportunity */}
            <div className={entityStyle}>
                <h3 className={weakEntityTitleStyle}>Opportunity</h3>
                <ul className={fieldListStyle}>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>id</span>
                        <span className={pkBadge}>PK</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idAccount</span>
                        <span className={fkBadge}>FK (Account)</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idAgent</span>
                        <span className={fkBadge}>FK (Agent)</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>concepto</span>
                        <span className={fieldTypeStyle}>string</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>importe</span>
                        <span className={fieldTypeStyle}>number</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>fase</span>
                        <span className={fieldTypeStyle}>enum</span>
                    </li>
                </ul>
            </div>

            {/* Activity */}
             <div className={entityStyle}>
                <h3 className={weakEntityTitleStyle}>Activity</h3>
                 <ul className={fieldListStyle}>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>id</span>
                        <span className={pkBadge}>PK</span>
                    </li>
                    <li className={fieldStyle}>
                        <span className={fieldNameStyle}>idOpportunity</span>
                        <span className={fkBadge}>FK (Opportunity)</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>tipo</span>
                        <span className="font-mono text-blue-600">enum</span>
                    </li>
                     <li className={fieldStyle}>
                        <span className={fieldNameStyle}>fecha</span>
                        <span className="font-mono text-blue-600">date</span>
                    </li>
                      <li className={fieldStyle}>
                        <span className={fieldNameStyle}>notas</span>
                        <span className="font-mono text-blue-600">string</span>
                    </li>
                </ul>
            </div>
        </div>
         <div className={relationSectionStyle}>
          <h4 className={relationTitleStyle}>Relaciones de Venta:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li className={relationTextStyle}>
              Un `Contact` puede o no pertenecer a un `Account` (Relación N a 1, opcional).
            </li>
            <li className={relationTextStyle}>
              La tabla `Portfolio` crea una relación **Muchos a Muchos** entre `Agent` y `Account`. Un agente puede tener muchos clientes, y un cliente puede ser gestionado por varios agentes.
            </li>
             <li className={relationTextStyle}>
              Una `Opportunity` pertenece a un `Account` y a un `Agent` específico (Relaciones N a 1). Esto permite que cada agente tenga sus propias oportunidades para un mismo cliente.
            </li>
             <li className={relationTextStyle}>
              Una `Activity` (llamada, reunión) pertenecerá a una `Opportunity` (Relación N a 1), detallando las interacciones.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
