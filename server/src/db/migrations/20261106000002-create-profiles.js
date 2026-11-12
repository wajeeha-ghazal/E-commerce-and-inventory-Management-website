'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '',
      },
      shippingAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      avatarUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('profiles', ['userId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profiles');
  },
};
