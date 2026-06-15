<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
        'nom'       => 'required|string|max:255',
        'type_prix' => 'required|in:fixed,per_km,per_day', // Les valeurs de l'enum de la DB
        'tarif'     => 'required|numeric|min:0',
    ]);

    // 2. Mapping et création de l'enregistrement dans la base de données
    $service = Service::create([
        'name'       => $validated['nom'],
        'price_type' => $validated['type_prix'],
        'price'      => $validated['tarif'],
    ]);

    // 3. Retour de la réponse JSON au client
    return response()->json([
        'status'  => 'success',
        'message' => 'Service créé avec succès',
        'data'    => $service
    ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
