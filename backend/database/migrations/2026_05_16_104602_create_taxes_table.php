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
        Schema::create('taxes', function (Blueprint $table) {
             $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->boolean('paid')->default(false);

            $table->unique(['car_id', 'year']);
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
        Schema::dropIfExists('taxes');
    }
};
