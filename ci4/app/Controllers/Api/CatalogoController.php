<?php

namespace App\Controllers\Api;

/**
 * Gestiona los catálogos (listas maestras ampliables).
 *
 * GET    /api/v1/catalogo/{tipo}         → listar
 * POST   /api/v1/catalogo/{tipo}         → crear
 * DELETE /api/v1/catalogo/{tipo}/{id}    → eliminar
 *
 * Tipos válidos: patologias | materiales | actividades
 */
class CatalogoController extends BaseApiController
{
    private static array $tablas = [
        'patologias' => 'cat_patologias',
        'materiales' => 'cat_materiales',
        'actividades' => 'cat_actividades',
    ];

    public function index(string $tipo)
    {
        $tabla = $this->resolverTabla($tipo);
        if (!$tabla) return $this->error("Catálogo '{$tipo}' no existe", 404);

        $items = $this->db->table($tabla)
            ->where('activo', 1)
            ->orderBy('nombre', 'ASC')
            ->get()->getResultArray();

        return $this->ok($items);
    }

    public function create(string $tipo)
    {
        $tabla = $this->resolverTabla($tipo);
        if (!$tabla) return $this->error("Catálogo '{$tipo}' no existe", 404);

        $nombre = trim($this->request->getJSON(true)['nombre'] ?? '');
        if (!$nombre) return $this->error('El nombre es obligatorio', 400);

        // Evitar duplicados
        $existe = $this->db->table($tabla)->where('nombre', $nombre)->countAllResults();
        if ($existe) return $this->error('Ya existe ese elemento en el catálogo', 409);

        $this->db->table($tabla)->insert([
            'nombre'     => $nombre,
            'activo'     => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $item = $this->db->table($tabla)->where('id', $this->db->insertID())->get()->getRowArray();

        return $this->created($item, 'Elemento añadido al catálogo');
    }

    public function delete(string $tipo, int $id)
    {
        $tabla = $this->resolverTabla($tipo);
        if (!$tabla) return $this->error("Catálogo '{$tipo}' no existe", 404);

        $item = $this->db->table($tabla)->where('id', $id)->get()->getRowArray();
        if (!$item) return $this->notFound('Elemento no encontrado');

        // Desactivar en lugar de borrar para no romper registros históricos
        $this->db->table($tabla)->where('id', $id)->update(['activo' => 0]);

        return $this->noContent();
    }

    private function resolverTabla(string $tipo): ?string
    {
        return self::$tablas[$tipo] ?? null;
    }
}
