<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\RentalExtensionController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\InsuranceController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Car Rental API is working!',
        'data' => [
            'app' => 'Car Rental',
            'version' => '1.0.0',
        ]
    ]);
});
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/reset-password', [UserController::class,'resetPassword']);


    Route::apiResource('cars', CarController::class);

    Route::apiResource('clients', ClientController::class);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('insurances', InsuranceController::class);

    Route::apiResource('maintenance', MaintenanceController::class);

    Route::patch('/maintenances/{maintenance}/complete', [MaintenanceController::class, 'complete']);

    Route::apiResource('rentals', RentalController::class);

    Route::post('rental/{rental}/exension',[RentalExtensionController::class,'store']);
    
    Route::post('/rentals/{rental}/payments', [RentalController::class, 'addPayment']);
    Route::patch('/rentals/{rental}/cancel', [RentalController::class, 'cancel']);
    Route::get('/rentals/{rental}/invoice', [InvoiceController::class, 'generate']);




    Route::get('createrental', [RentalController::class, 'create']);

    Route::apiResource('taxes', TaxController::class);

    Route::apiResource('services', ServiceController::class);

});