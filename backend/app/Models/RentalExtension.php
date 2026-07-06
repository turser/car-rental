<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalExtension extends Model
{
    use HasFactory;

         protected $fillable = [
        'rental_id',
        'old_end_date',
        'new',
        
    ];

       public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
