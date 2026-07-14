<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id' ,
        'amount' , 
        'payment_method' , 
        'payment_date',
    ];

    public function car()
{
    return $this->belongsTo(Car::class);
}

public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }
}
