export default function TestCSS() {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Prueba de CSS</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-2">Tarjeta 1</h2>
            <p className="text-muted-foreground">
              Esta es una tarjeta de prueba para verificar que los estilos de Tailwind estén funcionando.
            </p>
            <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Botón Primario
            </button>
          </div>
  
          <div className="bg-secondary p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-2">Tarjeta 2</h2>
            <p className="text-secondary-foreground">Esta es otra tarjeta de prueba con un estilo diferente.</p>
            <button className="mt-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90">
              Botón Destructivo
            </button>
          </div>
        </div>
  
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            Si puedes ver esta página con estilos aplicados correctamente, significa que Tailwind CSS está funcionando.
          </p>
        </div>
      </div>
    )
  }
  
  