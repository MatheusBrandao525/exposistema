<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdSpaceController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Support\Facades\Artisan;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Resource Routes
Route::apiResource('spaces', AdSpaceController::class);
Route::apiResource('sales', SaleController::class);

// Migration Helper for Shared Hosting (Protected by APP_KEY as simple auth)
Route::get('/system/migrate', function () {
    if (request('key') !== config('app.key')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    Artisan::call('migrate', ['--force' => true]);
    return response()->json(['output' => Artisan::output()]);
});

// Link Storage Helper
Route::get('/system/link-storage', function () {
    if (request('key') !== config('app.key')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    Artisan::call('storage:link');
    return response()->json(['output' => Artisan::output()]);
});
