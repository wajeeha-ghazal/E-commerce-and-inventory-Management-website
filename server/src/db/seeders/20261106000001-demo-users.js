'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const adminHash = bcrypt.hashSync('AdminPass123!', 10);
    const customerHash = bcrypt.hashSync('CustomerPass123!', 10);

    const now = new Date();

    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 1,
          email: 'admin@ecomm.dev',
          passwordHash: adminHash,
          role: 'admin',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          email: 'customer@ecomm.dev',
          passwordHash: customerHash,
          role: 'customer',
          createdAt: now,
          updatedAt: now,
        },
      ],
      { returning: ['id'] }
    );

    // Sync sequence if necessary in postgres
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;`
    );

    await queryInterface.bulkInsert('profiles', [
      {
        id: 1,
        userId: 1,
        fullName: 'Alexander Vance',
        phone: '+1 (555) 019-2834',
        shippingAddress: '100 Market St, Suite 400, San Francisco, CA 94105',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        userId: 2,
        fullName: 'Jane Elizabeth Doe',
        phone: '+1 (555) 438-9201',
        shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('profiles', 'id'), coalesce(max(id), 1)) FROM profiles;`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
