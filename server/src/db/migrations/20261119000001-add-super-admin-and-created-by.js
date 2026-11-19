'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add 'super_admin' to PostgreSQL enum if missing
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type typ
          JOIN pg_enum enm ON typ.oid = enm.enumtypid
          WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'super_admin'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE 'super_admin';
        END IF;
      END
      $$;
    `);

   
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET role = 'super_admin' 
      WHERE id = 1 OR email = 'admin@ecomm.dev';
    `);

    // 3. Add createdBy to categories table with RESTRICT
    await queryInterface.addColumn('categories', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('categories', ['createdBy']);

    await queryInterface.addColumn('products', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('products', ['createdBy']);

    // 5. Backfill existing records with the super_admin user
    const [superAdmins] = await queryInterface.sequelize.query(`
      SELECT id FROM users 
      WHERE role = 'super_admin' 
      ORDER BY id ASC LIMIT 1;
    `);

    if (superAdmins && superAdmins.length > 0) {
      const superAdminId = superAdmins[0].id;
      await queryInterface.sequelize.query(`
        UPDATE categories SET "createdBy" = ${superAdminId} WHERE "createdBy" IS NULL;
      `);
      await queryInterface.sequelize.query(`
        UPDATE products SET "createdBy" = ${superAdminId} WHERE "createdBy" IS NULL;
      `);
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'createdBy');
    await queryInterface.removeColumn('categories', 'createdBy');
  },
};
