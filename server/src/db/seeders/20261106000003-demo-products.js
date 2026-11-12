'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const products = [
      // Category 1: Handcrafted Leather Goods
      {
        id: 1,
        categoryId: 1,
        title: 'Cognac Bifold Card Wallet',
        description:
          'Ultra-slim 6-pocket card wallet made with full-grain Wickett & Craig bridle leather. Hand-stitched with waxed linen thread for a lifetime of patina.',
        sku: 'LTH-CRD-001',
        price: 68.0,
        stock: 35,
        imageUrl:
          'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        categoryId: 1,
        title: 'Heritage Leather Tote Bag',
        description:
          'Spacious daily tote featuring reinforced copper rivets, vegetable-tanned straps, and an internal brass key lanyard. Fits 15-inch laptops.',
        sku: 'LTH-TOT-002',
        price: 245.0,
        stock: 18,
        imageUrl:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        categoryId: 1,
        title: 'Artisan Journal Cover with Brass Pen Loop',
        description:
          'Refillable A5 notebook cover in rich saddle tan. Burnished edges with natural beeswax, includes an archival lined notebook.',
        sku: 'LTH-JRN-003',
        price: 84.0,
        stock: 22,
        imageUrl:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        categoryId: 1,
        title: 'Nomad Field Watch Strap 20mm',
        description:
          'Heavyweight Horween Chromexcel leather with matte stainless steel hardware. Water-resistant and soft on the wrist.',
        sku: 'LTH-WTC-004',
        price: 55.0,
        stock: 40,
        imageUrl:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },

      // Category 2: Artisan Ceramics & Stoneware
      {
        id: 5,
        categoryId: 2,
        title: 'Terracotta Fluted Ceramic Mug',
        description:
          'Wheel-thrown 12oz stoneware mug featuring a matte terracotta speckled exterior and a satin cream food-safe interior glaze.',
        sku: 'CER-MUG-005',
        price: 38.0,
        stock: 45,
        imageUrl:
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        categoryId: 2,
        title: 'Earthy Stoneware Dinner Plate Set (4-Pack)',
        description:
          'Set of four low-rim stoneware plates with exposed raw clay footings. Dishwasher and microwave safe.',
        sku: 'CER-PLT-006',
        price: 130.0,
        stock: 14,
        imageUrl:
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        categoryId: 2,
        title: 'Sculptural Sandstone Ribbed Vase',
        description:
          'A striking statement piece for dried florals and olive branches. Hand-carved fluting with raw textural sandstone finish.',
        sku: 'CER-VAS-007',
        price: 78.0,
        stock: 19,
        imageUrl:
          'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        categoryId: 2,
        title: 'Rustic Matcha Whisk Bowl (Chawan)',
        description:
          'Traditional wide-lipped tea bowl crafted for whisking ceremonial matcha. Features subtle organic indentations for natural grip.',
        sku: 'CER-MCH-008',
        price: 46.0,
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },

      // Category 3: Specialty Coffee & Brewing
      {
        id: 9,
        categoryId: 3,
        title: 'Gooseneck Temperature-Control Kettle',
        description:
          'Precision 0.9L matte charcoal electric kettle with PID strix controller and 60-minute temperature hold function.',
        sku: 'COF-KTL-009',
        price: 159.0,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 10,
        categoryId: 3,
        title: 'Ceramic Dripper Stand with Walnut Base',
        description:
          'Dual-material pour-over dripper stand. Hand-finished American walnut with a solid brass support arm compatible with V60 cone drippers.',
        sku: 'COF-DRP-010',
        price: 88.0,
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 11,
        categoryId: 3,
        title: 'Precision Hand Coffee Grinder (48mm Burrs)',
        description:
          'CNC-machined aluminum chassis with 48mm heptagonal stainless steel burrs. Stepped micrometer dial for espresso to French press.',
        sku: 'COF-GRN-011',
        price: 125.0,
        stock: 28,
        imageUrl:
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 12,
        categoryId: 3,
        title: 'Double-Walled Borosilicate Glass Carafe 600ml',
        description:
          'Thermal insulating glass server keeping brew hot while exterior stays comfortable to touch. Level measurement markings on side.',
        sku: 'COF-CRF-012',
        price: 36.0,
        stock: 38,
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },

      // Category 4: Minimalist Workspace
      {
        id: 13,
        categoryId: 4,
        title: 'Solid American Walnut Monitor Riser',
        description:
          'Single-plank Appalachian walnut stand with integrated cork dampening pads. Raises screen to eye level and clears keyboard desk clutter.',
        sku: 'WRK-RSR-013',
        price: 119.0,
        stock: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 14,
        categoryId: 4,
        title: 'Merino Wool Felt Desk Pad (Charcoal 90x40cm)',
        description:
          '5mm thick pure virgin German merino wool felt. Naturally static-resistant, smooth mouse gliding, and sound-dampening surface.',
        sku: 'WRK-PAD-014',
        price: 64.0,
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 15,
        categoryId: 4,
        title: 'Turned Brass Rollerball Pen',
        description:
          'Balanced heavyweight untreated brass writing instrument with screw cap. Develops a warm individual patina with each month of use.',
        sku: 'WRK-PEN-015',
        price: 48.0,
        stock: 50,
        imageUrl:
          'https://images.unsplash.com/photo-1585336261026-77cc7c39245f?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 16,
        categoryId: 4,
        title: 'Magnetic Cable Channel & Dock Block',
        description:
          'Weighted walnut and brushed stainless steel cable organizer. Keeps charging cables firmly docked on desk edges without slipping.',
        sku: 'WRK-ORG-016',
        price: 39.0,
        stock: 44,
        imageUrl:
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },

      // Category 5: Organic Textiles & Apparel
      {
        id: 17,
        categoryId: 5,
        title: 'Washed French Linen Button-Down Shirt',
        description:
          'Relaxed-fit 100% Normandy flax linen shirt pre-washed with pumice stones for immediate softness and breathable drape.',
        sku: 'APP-LNN-017',
        price: 110.0,
        stock: 24,
        imageUrl:
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 18,
        categoryId: 5,
        title: 'Heavy Organic Canvas Chore Jacket',
        description:
          '12oz GOTS organic cotton duck canvas with reinforced triple-needle stitching, corozo nut buttons, and 3 drop pockets.',
        sku: 'APP-JKT-018',
        price: 185.0,
        stock: 16,
        imageUrl:
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 19,
        categoryId: 5,
        title: 'Waffle-Weave Turkish Bath Towel Set',
        description:
          'Set of two ultra-absorbent organic Aegean cotton waffle towels. Fast drying, compact, and softer with every wash.',
        sku: 'APP-TWL-019',
        price: 72.0,
        stock: 32,
        imageUrl:
          'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 20,
        categoryId: 5,
        title: 'Merino Wool Knit Beanie (Oatmeal)',
        description:
          'Ribbed fisherman beanie spun from non-mulesed extrafine merino wool. Naturally thermoregulating and itch-free.',
        sku: 'APP-HAT-020',
        price: 42.0,
        stock: 40,
        imageUrl:
          'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('products', products);

    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1)) FROM products;`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};
