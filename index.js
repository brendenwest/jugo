/*
  jugo object
*/

var database = require('./lib/database.js'),
    monitor = require('./lib/monitor.js'),
    universe = require('./lib/universe.js');


/*
  jugo object init

  @param config::object <- jugo config object

  returns object {
    collect:: function() <- start collector daemon
    get:: function(query, callback) <- get tweet aggregates
  }
*/
function jugo(config) {

  var db = database(config);

  function collect() {
    // open database connection...
    db.open(function() {
      // get authorities and their followers...
      universe.populate(config.accounts, function(auth_data) {
        // stream tweets from authorities and followers...
        monitor(auth_data).tweet(function(tweet){
          // each time there is a tweet, log and collect
          console.log('@'+tweet.user.screen_name + ':::' + tweet.text);
          // add tweet to database
          db.add(tweet);
        })
        // begin collecting
        .init();
      });
    });
  }

  function get(query, callback) {
    query = query || {};
    db.open(function() {
      db.get(query, callback)
    })
  }

  return {
    collect : collect,
    get : get
  }

}


var jugo_config = require('./jugo.json');

var J = jugo(jugo_config);

J.get({ max_date : new Date() }, function(results) {
    console.log(results)
  });

//module.exports = jugo;