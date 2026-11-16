'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add deletedAt column to categories
    await queryInterface.addColumn('categories', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    // 2. Drop existing global unique indexes/constraints on name and slug
    await queryInterface.removeIndex('categories', ['name']).catch(() => {});
    await queryInterface.removeIndex('categories', ['slug']).catch(() => {});

    await queryInterface.sequelize.query(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
    `);

    // 3. Create partial unique indexes enforcing uniqueness only among active categories
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX categories_name_active_unique 
      ON categories (name) 
      WHERE "deletedAt" IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX categories_slug_active_unique 
      ON categories (slug) 
      WHERE "deletedAt" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // 1. Drop the partial unique indexes
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS categories_name_active_unique;
      DROP INDEX IF EXISTS categories_slug_active_unique;
    `);

    // 2. Remove the deletedAt column
    await queryInterface.removeColumn('categories', 'deletedAt');

    // 3. Recreate global unique indexes
    await queryInterface.addIndex('categories', ['name'], { unique: true });
    await queryInterface.addIndex('categories', ['slug'], { unique: true });
  },
};
