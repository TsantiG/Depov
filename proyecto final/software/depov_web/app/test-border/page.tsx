export default function TestBorder() {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Prueba de Bordes</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p>Borde con clase "border"</p>
          </div>
  
          <div className="p-4 border-2 rounded-lg">
            <p>Borde con clase "border-2"</p>
          </div>
  
          <div className="p-4 border border-primary rounded-lg">
            <p>Borde con clase "border border-primary"</p>
          </div>
        </div>
  
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            Si puedes ver los bordes correctamente, significa que las clases de borde están funcionando.
          </p>
        </div>
      </div>
    )
  }
  
  