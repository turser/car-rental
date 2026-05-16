<?php

namespace App\Http\Controllers;

use App\Models\RentalExtension;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRentalExtensionRequest;
use App\Http\Requests\UpdateRentalExtensionRequest;

class RentalExtensionController extends Controller
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
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreRentalExtensionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRentalExtensionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\RentalExtension  $rentalExtension
     * @return \Illuminate\Http\Response
     */
    public function show(RentalExtension $rentalExtension)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\RentalExtension  $rentalExtension
     * @return \Illuminate\Http\Response
     */
    public function edit(RentalExtension $rentalExtension)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateRentalExtensionRequest  $request
     * @param  \App\Models\RentalExtension  $rentalExtension
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRentalExtensionRequest $request, RentalExtension $rentalExtension)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\RentalExtension  $rentalExtension
     * @return \Illuminate\Http\Response
     */
    public function destroy(RentalExtension $rentalExtension)
    {
        //
    }
}
