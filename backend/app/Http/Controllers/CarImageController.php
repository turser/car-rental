<?php

namespace App\Http\Controllers;

use App\Models\CarImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarImageRequest;
use App\Http\Requests\UpdateCarImageRequest;

class CarImageController extends Controller
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
     * @param  \App\Http\Requests\StoreCarImageRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreCarImageRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CarImage  $carImage
     * @return \Illuminate\Http\Response
     */
    public function show(CarImage $carImage)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\CarImage  $carImage
     * @return \Illuminate\Http\Response
     */
    public function edit(CarImage $carImage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateCarImageRequest  $request
     * @param  \App\Models\CarImage  $carImage
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateCarImageRequest $request, CarImage $carImage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CarImage  $carImage
     * @return \Illuminate\Http\Response
     */
    public function destroy(CarImage $carImage)
    {
        //
    }
}
