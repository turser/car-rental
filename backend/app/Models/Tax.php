<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    use HasFactory;
    protected $fillable = [
    'car_id',
    'year',
    'amount',
    'due_date',
    'paid'
    ];

    public function car(){
        return $this->belongsTo(Car::class) ;
    }

}
