<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../lib.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Symfony\Component\Dotenv\Dotenv;

// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/../.env');

// Set up the router
$app = AppFactory::create();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

# the router is used to require the php files
$app->post('/login', App\Login::class);
$app->post('/esp', App\Esp::class);


$app->run();

