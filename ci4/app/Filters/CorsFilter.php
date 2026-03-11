<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * CORS Filter — permite peticiones desde el frontend Vue (localhost:5173, etc.)
 *
 * Configura el origen permitido en .env:
 *   cors.origin = http://localhost:5173
 */
class CorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin  = env('cors.origin', 'http://localhost:5173');
        $headers = 'Content-Type, Authorization, X-Requested-With';
        $methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

        $response = service('response');
        $response->setHeader('Access-Control-Allow-Origin', $origin);
        $response->setHeader('Access-Control-Allow-Headers', $headers);
        $response->setHeader('Access-Control-Allow-Methods', $methods);
        $response->setHeader('Access-Control-Allow-Credentials', 'true');

        // Peticiones preflight OPTIONS → responder directamente
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return $response->setStatusCode(204);
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $origin = env('cors.origin', 'http://localhost:5173');

        return $response
            ->setHeader('Access-Control-Allow-Origin', $origin)
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->setHeader('Access-Control-Allow-Credentials', 'true');
    }
}
