<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalExtension extends Model
{
    use HasFactory;

         protected $fillable = [
        'rental_id',
        'service_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

       public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
