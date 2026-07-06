<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $clients = Client::whereHas(
            'rentals',
            function ($query) {

                $query->where(
                    'agency_id',
                    auth()->user()->agency_id
                );
            }
        )
            ->with([
                'rentals' => function ($query) {

                    $query->where(
                        'agency_id',
                        auth()->user()->agency_id
                    );
                }
            ])
            ->get();

        return response()->json($clients);
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

            'nomComplet' => 'required',
            'cin' => 'required|unique:clients',
            'numeroPermis' => 'required|unique:clients,driving_license',
            'expirationPermis' => 'required|date',
            'telephone' => 'required',
            'email' => 'nullable|email',
            'adresse' => 'nullable',
        ]);

        $client = Client::create([

            'full_name' => $validated['nomComplet'],
            'cin' => $validated['cin'],
            'driving_license' => $validated['numeroPermis'],
            'driving_license_expiration' => $validated['expirationPermis'],
            'phone' => $validated['telephone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['adresse'] ?? null,
        ]);

        return response()->json(['message' => 'Client créé avec succès', 'client' => $client], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Client $client)
    {
        return response()->json($client);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function update(Request $request, Client $client)
    {
       

      

        $validated = $request->validate([
            'nomComplet' => 'sometimes|required',
            'cin' => 'sometimes|required|unique:clients,cin,' . $client->id,
            'numeroPermis' => 'sometimes|required|unique:clients,driving_license,' . $client->id,
            'expirationPermis' => 'sometimes|required|date',
            'telephone' => 'sometimes|required',
            'email' => 'nullable|email',
            'adresse' => 'nullable',
        ]);

        $client->update([
            'full_name' =>$validated['nomComplet']?? $client->full_name,
            'cin' =>$validated['cin']?? $client->cin,
            'driving_license' =>$validated['numeroPermis']?? $client->driving_license,
            'driving_license_expiration' =>$validated['expirationPermis']?? $client->driving_license_expiration,
            'phone' =>$validated['telephone']?? $client->phone,
            'email' =>$validated['email']?? $client->email,
            'address' =>$validated['adresse']?? $client->address,
        ]);

        return response()->json([
            'message' => 'Client modifié avec succès',
            'client' => $client
        ]);

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
