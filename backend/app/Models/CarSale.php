<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'sale_date',
        'sale_price',
        'buyer_name',
        'buyer_contact',
    ];

    protected $casts = [
        'sale_date'  => 'date',
        'sale_price' => 'decimal:2',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
