//jshint esversion:6
module.exports = function (sequelize, DataTypes) {
  const Gallery = sequelize.define('gallery', {
    author : DataTypes.STRING,
    link : {type : DataTypes.STRING, unique : true},
    description : DataTypes.TEXT
  }, {
    tableName : 'gallery'
  });

  return Gallery;
};
