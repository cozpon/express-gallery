//jshint esversion:6
module.exports = function (sequelize, DataTypes) {
  const Gallery = sequelize.define('gallery', {
    author : DataTypes.STRING,
    link : DataTypes.STRING,
    description : DataTypes.TEXT
  }, {
    tableName : 'gallery'
  });

  return Gallery;
};
