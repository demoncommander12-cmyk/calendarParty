/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('exceptions', function(table) {
    table.increments('id').primary();
    table.integer('slot_id').notNullable();
    table.date('exception_date').notNullable();
    table.string('type').notNullable(); // 'update' or 'delete'
    table.time('start_time').nullable(); // null for delete, new time for update
    table.time('end_time').nullable(); // null for delete, new time for update
    table.string('title').nullable(); // null for delete, new title for update
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('slot_id').references('id').inTable('slots').onDelete('CASCADE');
    
    // Unique constraint to prevent multiple exceptions for same slot on same date
    table.unique(['slot_id', 'exception_date']);
    
    // Index for efficient querying by date
    table.index('exception_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('exceptions');
};
