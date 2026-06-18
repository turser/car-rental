<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;
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
}
