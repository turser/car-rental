<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Service extends Model
{
    use HasFactory ,  LogsActivity;

    protected $fillable = ['name', 'price_type', 'price'];

    public function getActivitylogOptions(): LogOptions{
        return LogOptions::defaults()
            ->logFillable() 
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();  
}
}
