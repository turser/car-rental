<?php

namespace App\Http\Controllers;

use App\Models\RentalService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRentalServiceRequest;
use App\Http\Requests\UpdateRentalServiceRequest;

class RentalServiceController extends Controller
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
     * @param  \App\Http\Requests\StoreRentalServiceRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreRentalServiceRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\RentalService  $rentalService
     * @return \Illuminate\Http\Response
     */
    public function show(RentalService $rentalService)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\RentalService  $rentalService
     * @return \Illuminate\Http\Response
     */
    public function edit(RentalService $rentalService)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateRentalServiceRequest  $request
     * @param  \App\Models\RentalService  $rentalService
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateRentalServiceRequest $request, RentalService $rentalService)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\RentalService  $rentalService
     * @return \Illuminate\Http\Response
     */
    public function destroy(RentalService $rentalService)
    {
        //
    }
}
