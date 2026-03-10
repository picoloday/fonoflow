<?php

namespace App\Filters;

use App\Libraries\JwtHelper;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * JWT Filter — protege las rutas de la API.
 *
 * Espera el token en la cabecera:
 *   Authorization: Bearer <token>
 *
 * Si el token es válido, guarda el payload en:
 *   $request->jwtPayload
 */
class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (!$header || strncmp($header, 'Bearer ', 7) !== 0) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['success' => false, 'message' => 'Token requerido']);
        }

        $token   = substr($header, 7);
        $payload = JwtHelper::decode($token);

        if (!$payload) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['success' => false, 'message' => 'Token inválido o expirado']);
        }

        // Adjuntar payload al request para usarlo en los controllers
        $request->jwtPayload = $payload;

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return null;
    }
}
