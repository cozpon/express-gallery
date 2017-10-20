//jshint esversion:6
module.exports = function (sequelize, DataTypes) {
  const artworks = sequelize.define('artworks', {
    author : DataTypes.STRING,
    link : {type : DataTypes.STRING, unique : true},
    description : DataTypes.TEXT
  }, {
    tableName : 'artworks'
  });

  artworks.associate = function(models) {
    artworks.belongsTo(models.users, {
      onDelete : "CASCADE",
      foreignKey: {
        allowNull: true
      }
    });
  };

  return artworks;
};
