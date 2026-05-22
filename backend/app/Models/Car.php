<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;
    public function images()
{
    return $this->hasMany(CarImage::class);
}

public function insurances()
{
    return $this->hasMany(Insurance::class);
}

public function maintenances()
{
    return $this->hasMany(Maintenance::class);
}

public function taxes()
{
    return $this->hasMany(Tax::class);
}

public function rentals()
{
    return $this->hasMany(Rental::class);
}

public function agency()
{
    return $this->belongsTo(Agency::class);
}
}
