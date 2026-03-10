<?php

namespace App\Controllers\Api;

use App\Libraries\JwtHelper;

/**
 * POST /api/v1/auth/login   → { token, expires_at }
 * POST /api/v1/auth/refresh → { token, expires_at }  (con token válido)
 *
 * Credenciales configuradas en .env:
 *   api.username = admin
 *   api.password = tu_contraseña_aqui   (texto plano o hash bcrypt)
 */
class AuthController extends BaseApiController
{
    /** Duración del token: 8 horas */
    private const TTL = 8 * 3600;

    public function login()
    {
        $json = $this->request->getJSON(true) ?? [];

        $username = trim($json['username'] ?? '');
        $password = $json['password'] ?? '';

        if (!$username || !$password) {
            return $this->error('Credenciales requeridas', 400);
        }

        $envUser = env('api.username', 'admin');
        $envPass = env('api.password', '');

        // Soporte para bcrypt ($2y$...) y texto plano
        $valid = strncmp($envPass, '$2y$', 4) === 0
            ? password_verify($password, $envPass)
            : hash_equals($envPass, $password);

        if ($username !== $envUser || !$valid) {
            return $this->error('Usuario o contraseña incorrectos', 401);
        }

        $exp   = time() + self::TTL;
        $token = JwtHelper::encode(['sub' => $envUser, 'exp' => $exp]);

        return $this->ok([
            'token'      => $token,
            'expires_at' => date('c', $exp),
        ], 'Login correcto');
    }

    public function refresh()
    {
        // El JwtFilter ya validó el token anterior antes de llegar aquí
        $exp   = time() + self::TTL;
        $user  = $this->request->jwtPayload['sub'] ?? 'admin';
        $token = JwtHelper::encode(['sub' => $user, 'exp' => $exp]);

        return $this->ok([
            'token'      => $token,
            'expires_at' => date('c', $exp),
        ], 'Token renovado');
    }
}
