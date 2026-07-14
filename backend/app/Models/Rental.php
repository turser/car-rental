<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'car_id',
        'agency_id',
        'start_date',
        'end_date',
        'actual_return_date',
        'price_per_day',
        'total_price',
        'paid_amount',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime', 
        'end_date' => 'datetime', 
        'actual_return_date' => 'datetime', 
        'price_per_day' => 'decimal:2',
        'total_price' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];
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

    public function extensions()
    {
        return $this->hasMany(RentalExtension::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
