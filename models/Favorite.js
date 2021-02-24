const Sequelize = require('sequelize');

module.exports = class Favorite extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          field: 'favorite_id',
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        createdAt: 'create_at',
        updatedAt: 'update_at',
        modelName: 'Favorite',
        tableName: 'Favorite',
        charset: 'utf8',
        collate: 'utf8_general_ci',
        underscored: true,
      },
    );
  }

  static associate(db) {
    db.User.belongsToMany(db.Category, { through: 'Favorite' });
    db.Category.belongsToMany(db.User, { through: 'Favorite' });
  }
};
