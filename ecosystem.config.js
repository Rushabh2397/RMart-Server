module.exports = {
    apps : [{
      name        : "rmart",
      script      : "./bin/www",
      watch       : true,
      env: {
        "PORT":6000,
        "HOST":"13.126.22.111"
      }
    }]
  }
