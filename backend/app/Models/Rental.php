<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id' , 
        'car_id' , 
        'agency_id' , 
        'start_date' , 
        'end_date' , 
        'actual_return_date' , 
        'price_per_day',
        'total_price', 
        'paid_amount', 
        'status',
    ] ;
    public function client()
{
    return $this->belongsTo(Client::class);
}

public function agency()
{
    return $this->belongsTo(Agency::class);
}

public function car()
{
    return $this->belongsTo(Car::class);
}

public function services()
{
    return $this->belongsToMany(
        Service::class,
        'rental_services'
    )
    ->withPivot([
        'quantity',
        'unit_price',
        'total_price'
    ])
    ->withTimestamps();
}
}
