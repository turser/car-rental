<?php

namespace App\Http\Controllers;

use App\Models\CarSale;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarSaleRequest;
use App\Http\Requests\UpdateCarSaleRequest;

class CarSaleController extends Controller
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
     * @param  \App\Http\Requests\StoreCarSaleRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreCarSaleRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CarSale  $carSale
     * @return \Illuminate\Http\Response
     */
    public function show(CarSale $carSale)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\CarSale  $carSale
     * @return \Illuminate\Http\Response
     */
    public function edit(CarSale $carSale)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCarSaleRequest  $request
     * @param  \App\Models\CarSale  $carSale
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCarSaleRequest $request, CarSale $carSale)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CarSale  $carSale
     * @return \Illuminate\Http\Response
     */
    public function destroy(CarSale $carSale)
    {
        //
    }
}
