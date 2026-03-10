<?php

namespace App\Controllers\Api;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Base para todos los API controllers.
 * Proporciona helpers para respuestas JSON estándar.
 */
abstract class BaseApiController extends Controller
{
    protected function ok($data, string $message = ''): ResponseInterface
    {
        return $this->response->setStatusCode(200)->setJSON([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    protected function created($data, string $message = 'Creado correctamente'): ResponseInterface
    {
        return $this->response->setStatusCode(201)->setJSON([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    protected function noContent(): ResponseInterface
    {
        return $this->response->setStatusCode(204);
    }

    protected function error(string $message, int $status = 400, array $errors = []): ResponseInterface
    {
        $body = ['success' => false, 'message' => $message];
        if ($errors) $body['errors'] = $errors;
        return $this->response->setStatusCode($status)->setJSON($body);
    }

    protected function notFound(string $message = 'Recurso no encontrado'): ResponseInterface
    {
        return $this->error($message, 404);
    }

    protected function unauthorized(string $message = 'No autorizado'): ResponseInterface
    {
        return $this->error($message, 401);
    }

    protected function validationError(array $errors): ResponseInterface
    {
        return $this->error('Error de validación', 422, $errors);
    }
}
