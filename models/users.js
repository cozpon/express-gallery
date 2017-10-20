module.exports = function (sequelize, dataTypes) {
  var users = sequelize.define('users', {
    username : {type : dataTypes.STRING, unique: true},
    password : dataTypes.STRING
  }, {
    tableName: 'users'
  });

  users.associate = function(models) {
    users.hasMany(models.artworks);
  };

  return users;
};