<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarImage extends Model
{
    use HasFactory;
    protected $fillable = [
    'car_id',
    'path',
    'is_primary'
];

    public function cars()
{
    return $this->belongsTo(CarImage::class);
}
}
