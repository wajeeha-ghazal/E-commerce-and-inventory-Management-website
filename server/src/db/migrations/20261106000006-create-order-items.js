'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    });

    // Composite unique constraint: each product can only appear once per order
    await queryInterface.addIndex('order_items', ['orderId', 'productId'], {
      unique: true,
      name: 'unique_order_item_product',
    });

    // Reverse lookup index (e.g. query all orders containing a product)
    await queryInterface.addIndex('order_items', ['productId']);

    await queryInterface.sequelize.query(
      'ALTER TABLE "order_items" ADD CONSTRAINT "check_order_items_qty_positive" CHECK ("quantity" > 0);'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "order_items" ADD CONSTRAINT "check_order_items_price_non_negative" CHECK ("unitPrice" >= 0);'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
