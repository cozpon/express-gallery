//jshint esversion:6

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    username : DataTypes.STRING  // this table will have a column named (username) that will take in a VARCHAR string
  }, {
    tableName : 'users' // makes your tablename PLURAL
  });

  User.associate = function (models){
    User.hasMany(models.task);
  };

  return User;
};
