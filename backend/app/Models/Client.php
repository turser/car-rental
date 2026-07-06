<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Client extends Model
{
    use HasFactory , LogsActivity;
    protected $fillable = [
    'full_name',
    'cin',
    'driving_license',
    'driving_license_expiration',
    'phone',
    'email',
    'address'
];
public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable() 
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();  
    }
public function rentals()
{
    return $this->hasMany(Rental::class);
}
}
