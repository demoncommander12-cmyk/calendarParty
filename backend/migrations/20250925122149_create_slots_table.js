/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('slots', function(table) {
    table.increments('id').primary();
    table.integer('weekday').notNullable(); // 0 = Sunday, 1 = Monday, etc.
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('title').nullable();
    table.timestamps(true, true);
    
    // Index for efficient querying by weekday
    table.index('weekday');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('slots');
};
