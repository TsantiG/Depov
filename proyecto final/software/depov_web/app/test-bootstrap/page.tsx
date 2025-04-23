export default function TestBootstrap() {
    return (
      <div className="container py-5">
        <h1 className="mb-4">Prueba de Bootstrap</h1>
  
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">Tarjeta de ejemplo</h5>
              </div>
              <div className="card-body">
                <p className="card-text">Este es un ejemplo de una tarjeta usando Bootstrap.</p>
                <button className="btn btn-primary">Botón primario</button>
              </div>
            </div>
          </div>
  
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0">Formulario de ejemplo</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="exampleInput" className="form-label">
                    Nombre
                  </label>
                  <input type="text" className="form-control" id="exampleInput" placeholder="Ingrese su nombre" />
                </div>
                <button className="btn btn-success">Enviar</button>
              </div>
            </div>
          </div>
        </div>
  
        <div className="alert alert-info mt-4">
          <h4 className="alert-heading">¡Bootstrap funciona!</h4>
          <p>Si puedes ver esta alerta con estilos, significa que Bootstrap está funcionando correctamente.</p>
        </div>
  
        <div className="mt-4">
          <h3>Ejemplos de botones</h3>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-warning">Warning</button>
            <button className="btn btn-info">Info</button>
          </div>
        </div>
      </div>
    )
  }
  
  