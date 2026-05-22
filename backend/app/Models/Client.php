<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    protected $fillable = [
    'full_name',
    'cin',
    'driving_license',
    'driving_license_expiration',
    'phone',
    'email',
    'address'
];
}
