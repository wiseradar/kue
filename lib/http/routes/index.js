
/**
 * Module dependencies.
 */

var Queue = require('../../q')
  , Job = require('../../queue/job')
  , queue = new Queue;

/**
 * Serve the index page.
 */

exports.index = function(req, res){
  res.render('index');
};

/**
 * Get statistics including:
 * 
 *   - inactive: array of inactive job ids
 *   - complete: array of complete job ids
 *   - active: array of active job ids
 *   - failures: array of failing job ids
 *
 */

exports.stats = function(req, res){
  get(queue)
    ('inactiveCount')
    ('completeCount')
    ('activeCount')
    ('failuresCount')
    (function(err, obj){
      if (err) return res.send({ error: err.message });
      res.send(obj);
    });
};

exports.jobStats = function(req, res){
  var id = req.params.id;
  Job.get(id, function(err, job){
    if (err) return res.send({ error: err.message });
    res.send(job);
  });
};

/**
 * Data fetching helper.
 */

function get(obj) {
  var pending = 0
    , res = {}
    , callback
    , done;

  return function _(arg){
    switch (typeof arg) {
      case 'function':
        callback = arg;
        break;
      case 'string':
        ++pending;
        obj[arg](function(err, val){
          if (done) return;
          if (err) return done = true, callback(err);
          res[arg] = val;
          --pending || callback(null, res);
        });
        break;
    }
    return _;
  };
}