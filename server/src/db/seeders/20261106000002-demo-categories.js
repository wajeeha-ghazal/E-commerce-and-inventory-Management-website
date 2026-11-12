'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Handcrafted Leather Goods',
        slug: 'leather-goods',
        description:
          'Vegetable-tanned full-grain leather wallets, bags, and daily carry accessories.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Artisan Ceramics & Stoneware',
        slug: 'ceramics-stoneware',
        description:
          'Wheel-thrown mugs, planters, dinnerware, and vases fired in natural earth glazes.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Specialty Coffee & Brewing',
        slug: 'coffee-brewing',
        description:
          'Precision pour-over kettles, hand grinders, drippers, and micro-lot whole bean roasts.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Minimalist Workspace',
        slug: 'minimalist-workspace',
        description:
          'Solid walnut monitor stands, merino wool desk mats, and ergonomic desk organization.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Organic Textiles & Apparel',
        slug: 'organic-textiles',
        description:
          'GOTS-certified organic linen shirts, heavy cotton chore coats, and waffle-weave towels.',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('categories', 'id'), coalesce(max(id), 1)) FROM categories;`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
