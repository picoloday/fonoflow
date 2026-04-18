<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Preflight CORS — responde a todos los OPTIONS antes de cualquier otra ruta
$routes->options('(:any)', static function () {
    return service('response')->setStatusCode(204);
});

// Dashboard
$routes->get('/', 'Home::index');

// -------------------------------------------------------
// Pacientes
// -------------------------------------------------------
$routes->get('pacientes',                      'Pacientes::index');
$routes->get('pacientes/nuevo',                'Pacientes::nuevo');
$routes->post('pacientes/nuevo',               'Pacientes::guardar');
$routes->get('pacientes/(:num)',               'Pacientes::ver/$1');
$routes->get('pacientes/(:num)/editar',        'Pacientes::editar/$1');
$routes->post('pacientes/(:num)/editar',       'Pacientes::actualizar/$1');
$routes->post('pacientes/(:num)/eliminar',     'Pacientes::eliminar/$1');

// -------------------------------------------------------
// Agenda / Citas
// -------------------------------------------------------
$routes->get('agenda',                         'Citas::index');
$routes->get('citas/nueva',                    'Citas::nueva');
$routes->post('citas/nueva',                   'Citas::guardar');
$routes->get('citas/huecos/(:any)',            'Citas::huecos/$1');   // AJAX
$routes->get('citas/(:num)',                   'Citas::ver/$1');
$routes->get('citas/(:num)/editar',            'Citas::editar/$1');
$routes->post('citas/(:num)/editar',           'Citas::actualizar/$1');
$routes->post('citas/(:num)/asistencia',       'Citas::asistencia/$1');
$routes->post('citas/(:num)/cancelar',         'Citas::cancelar/$1');
$routes->post('citas/(:num)/eliminar',         'Citas::eliminar/$1');

// -------------------------------------------------------
// Sesiones
// -------------------------------------------------------
$routes->get('sesiones',                       'Sesiones::index');
$routes->get('sesiones/nueva',                 'Sesiones::nueva');
$routes->post('sesiones/nueva',                'Sesiones::guardar');
$routes->get('sesiones/(:num)',                'Sesiones::ver/$1');
$routes->get('sesiones/(:num)/editar',         'Sesiones::editar/$1');
$routes->post('sesiones/(:num)/editar',        'Sesiones::actualizar/$1');
$routes->post('sesiones/(:num)/eliminar',      'Sesiones::eliminar/$1');
$routes->post('sesiones/(:num)/objetivo/(:num)', 'Sesiones::toggleObjetivo/$1/$2'); // AJAX
$routes->get('sesiones/paciente/(:num)',        'Sesiones::infoPaciente/$1');       // AJAX

// -------------------------------------------------------
// API v1 — REST JSON
// -------------------------------------------------------
// Auth pública (sin JWT)
$routes->post('api/v1/auth/login',   '\App\Controllers\Api\AuthController::login');
$routes->post('api/v1/auth/refresh', '\App\Controllers\Api\AuthController::refresh', ['filter' => 'jwt']);

// API v1 — rutas protegidas por JWT
$routes->group('api/v1', ['namespace' => 'App\Controllers\Api', 'filter' => 'jwt'], function ($routes) {

    // Dashboard
    $routes->get('dashboard', 'DashboardController::index');

    // Pacientes
    $routes->get('pacientes/patologias',    'PacientesController::patologias');
    $routes->get('pacientes',               'PacientesController::index');
    $routes->post('pacientes',              'PacientesController::create');
    $routes->get('pacientes/(:num)',            'PacientesController::show/$1');
    $routes->put('pacientes/(:num)',            'PacientesController::update/$1');
    $routes->delete('pacientes/(:num)',         'PacientesController::delete/$1');
    $routes->post('pacientes/(:num)/agendar',   'PacientesController::agendar/$1');

    // Agenda + Citas
    $routes->get('agenda',                          'CitasController::agenda');
    $routes->get('citas/huecos/(:any)',             'CitasController::huecos/$1');
    $routes->get('citas',                           'CitasController::index');
    $routes->post('citas',                          'CitasController::create');
    $routes->get('citas/(:num)',                    'CitasController::show/$1');
    $routes->put('citas/(:num)',                    'CitasController::update/$1');
    $routes->delete('citas/(:num)',                 'CitasController::delete/$1');
    $routes->post('citas/(:num)/asistencia',        'CitasController::asistencia/$1');
    $routes->post('citas/(:num)/cancelar',          'CitasController::cancelar/$1');

    // Sesiones
    $routes->get('sesiones/pendientes-reprogramar',  'SesionesController::pendientesReprogramar');
    $routes->get('sesiones/materiales',             'SesionesController::materiales');
    $routes->get('sesiones/actividades',            'SesionesController::actividades');
    $routes->get('sesiones/motivos',                'SesionesController::motivos');
    $routes->post('sesiones/(:num)/reprogramar',    'SesionesController::toggleReprogramar/$1');
    $routes->get('sesiones/paciente/(:num)',        'SesionesController::infoPaciente/$1');
    $routes->get('sesiones',                        'SesionesController::index');
    $routes->post('sesiones',                       'SesionesController::create');
    $routes->get('sesiones/(:num)',                 'SesionesController::show/$1');
    $routes->put('sesiones/(:num)',                 'SesionesController::update/$1');
    $routes->delete('sesiones/(:num)',              'SesionesController::delete/$1');
    $routes->post('sesiones/(:num)/completar',      'SesionesController::completar/$1');
    $routes->post('sesiones/(:num)/resetear',       'SesionesController::resetear/$1');
    $routes->post('sesiones/(:num)/objetivo/(:num)','SesionesController::toggleObjetivo/$1/$2');

    // Pagos mensuales
    $routes->get('pagos',                               'PagosController::index');
    $routes->put('pagos/(:num)/(:any)',                 'PagosController::update/$1/$2');

    // Festivos
    $routes->get('festivos',                            'FestivosController::index');
    $routes->post('festivos/sync',                      'FestivosController::sync');
    $routes->delete('festivos/(:num)',                  'FestivosController::delete/$1');

    // Catálogos (listas maestras ampliables)
    $routes->get('catalogo/(:segment)',             'CatalogoController::index/$1');
    $routes->post('catalogo/(:segment)',            'CatalogoController::create/$1');
    $routes->delete('catalogo/(:segment)/(:num)',   'CatalogoController::delete/$1/$2');
});
