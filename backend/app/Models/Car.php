<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Car extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'brand',
        'model',
        'registration_number',
        'purchase_date',
        'purchase_price',
        'mileage',
        'daily_price',
        'status',
        'fuel_type',
        'agency_id'
    ];
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
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

    public function primaryImage(): HasOne
    {
        return $this->hasOne(CarImage::class)->where('is_primary', true);
    }

     public function sales(): HasMany
    {
        return $this->hasMany(CarSale::class, 'car_id');
    }
}
