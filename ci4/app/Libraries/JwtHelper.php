<?php

namespace App\Libraries;

/**
 * JWT HS256 puro PHP — sin dependencias externas.
 *
 * Uso:
 *   $token  = JwtHelper::encode(['sub' => 1, 'exp' => time() + 3600]);
 *   $payload = JwtHelper::decode($token);   // null si inválido o expirado
 */
class JwtHelper
{
    private static function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64urlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    public static function encode(array $payload): string
    {
        $secret  = env('jwt.secret', 'changeme_secret_32chars_minimum!!');
        $header  = self::b64url(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = self::b64url(json_encode($payload));
        $sig     = self::b64url(hash_hmac('sha256', "$header.$payload", $secret, true));
        return "$header.$payload.$sig";
    }

    public static function decode(string $token): ?array
    {
        $secret = env('jwt.secret', 'changeme_secret_32chars_minimum!!');
        $parts  = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $sig] = $parts;
        $expected = self::b64url(hash_hmac('sha256', "$header.$payload", $secret, true));

        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode(self::b64urlDecode($payload), true);
        if (!$data) return null;
        if (isset($data['exp']) && $data['exp'] < time()) return null;

        return $data;
    }
}
