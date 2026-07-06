<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
                $table->string('brand');
                $table->string('model');
                $table->string('registration_number')->unique();
                $table->date('purchase_date');
                $table->decimal('purchase_price', 10, 2)->nullable();
                $table->integer('mileage')->default(0);
                $table->decimal('daily_price', 10, 2);
                $table->enum('status', ['available', 'rented', 'maintenance', 'sold'])->default('available');
                $table->string('fuel_type');
                $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cars');
    }
};
