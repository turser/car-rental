<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->dateTime('start_date')->change();
            $table->dateTime('end_date')->change();
            $table->dateTime('actual_return_date')
                ->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('datetime_in_rentals', function (Blueprint $table) {
            //
        });
    }
};
