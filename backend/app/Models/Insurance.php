<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;


class Insurance extends Model
{
    use HasFactory , LogsActivity ;

    protected $fillable = [
    'car_id',
    'company',
    'contract_number',
    'start_date',
    'end_date',
    'price'
];
public function getActivitylogOptions(): LogOptions{
        return LogOptions::defaults()
            ->logFillable() 
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();  
}

public function car()
{
    return $this->belongsTo(Car::class);
}

}
