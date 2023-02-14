module.exports = {
  mysqldb: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crud_api',
  },
  // mongodb: {
  //     host: process.env.MONGOHOST || 'localhost',
  //     user: process.env.MONGOUSER || '',
  //     password: process.env.MONGOPASSWORD || '',
  //     database: 'ceacademy_db',
  //     port: process.env.MONGOPORT || 27017,
  // },
  mongodb: {
    host: 'containers-us-west-29.railway.app',
    user: 'mongo',
    password: 'QeqtrEAbNx1b8RZooPnX',
    database: 'usersubs',
    port: 7198,
  },
};
