var express = require('express');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var assert= require('assert');
var crypto = require('crypto-js');
var engines = require('consolidate');
var validator = require('validator');
var bodyParser = require('body-parser');


var app = express();
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(express.static("public"));
app.use(bodyParser.json());

//Enviroment Variables
var dbuser = "heroku_jprck61g";
var dbpassword = "3gjm35k3i2j81s8pcsd3mada05";
var keyValue = dbuser + dbpassword;

app.get('/', function (request,response) {
  response.redirect("/apidoc/");
});

MongoClient.connect(
  "mongodb://heroku_jprck61g:3gjm35k3i2j81s8pcsd3mada05@ds155192.mlab.com:55192/heroku_jprck61g",
  function(error, db)
  {
    assert.equal(error,null);
    console.log("Succes Conection Server MongoDB");

    /**
     * @api {get} /kiwibot-simulation/id/:id User
     * @apiExample {curl} Succes User
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/id/596517c9f071bd0fc843c869
     * @apiGroup USER
     * @apiParam {String} id idUser
     * @apiSuccess {Object} user Object user
     * @apiSuccess {String} user.name personal name of the user
     * @apiSuccess {String} user.nickname nickname of the user
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "user":{
     *          "name":"Carlos Zubieta",
     *          "nickname":"zubcarz"
     *      }}
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.get('/kiwibot-simulation/id/:id', function (request,response) {
      var objectId = new mongo.ObjectID(request.params.id);
      var projection = {"_id":0,"user.email":0,"user.password":0,"scores":0,"total_score":0};
      var querry = {"_id": objectId};
      var cursor = db.collection('Users').find(querry,projection).limit(1);

      cursor.forEach(
        function(doc){
          response.send(doc);
        },
        function (error) {
          assert.equal(error,null);
        }
       );
    });

    /**
     * @api {get} /kiwibot-simulation/user/id/:id/scores User list Scores
     * @apiExample {curl} Succes User scores
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/user/id/596517c9f071bd0fc843c869/scores
     * @apiGroup USER
     * @apiParam {String} id idUser
     * @apiSuccess {scores[]} scores list of scores user
     * @apiSuccess {String} score score user
     * @apiSuccess {String} level level score
     * @apiSuccess {String} total_score Sum all scores
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *   {"scores":
            [{"score":100,"level":1},
            {"score":200,"level":2}],
         "total_score":300}
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.get('/kiwibot-simulation/user/id/:id/scores', function (request,response) {
      var objectId = new mongo.ObjectID(request.params.id);
      var projection = {"_id":0,"user":0};
      var querry = {"_id": objectId};
      var cursor = db.collection('Users').find(querry,projection).limit(1);

      cursor.forEach(
        function(doc){
          response.send(doc);
        },
        function (error) {
          assert.equal(error,null);
        }
       );

    });

    /**
     * @api {get} /kiwibot-simulation/users User List
     * @apiExample {curl} Succes User list
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/users
     * @apiGroup USER
     * @apiSuccess {users[]} user list user
     * @apiSuccess {String} user.name personal name of the user
     * @apiSuccess {String} user.nickname nickname of the user
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    [
     *      "user":{
     *          "name":"Carlos Zubieta",
     *          "nickname":"zubcarz"
     *      }]
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.get('/kiwibot-simulation/users/', function (request,response) {
      var projection = {"_id":0,"user.email":0,"user.password":0,"scores":0,"total_score":0};
      var cursor =  db.collection('Users').find({},projection);

       cursor.toArray(function(err, docs) {
              assert.equal(null,err);
              response.send(docs);
        });
    });

    /**
     * @api {get} /kiwibot-simulation/scores/top Scores top
     * @apiExample {curl} Succes Score Top
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/scores/top
     * @apiGroup SCORES
     * @apiSuccess {users[]} user list user
     * @apiSuccess {String} user.name personal name of the user
     * @apiSuccess {String} user.nickname nickname of the user
     * @apiSuccess {int} total_score nickname of the user
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    [{
     *      "user":{
     *          "name":"Carlos Zubieta",
     *          "nickname":"zubcarz"
     *      },
     *      "total_score":300
     *      }]
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.get('/kiwibot-simulation/scores/top', function (request,response) {
      var projection = {"_id":0,"user.nickname":1,"total_score":1};
      var sort = {"total_score":-1};
      var cursor =  db.collection('Users').find({},projection).sort(sort).limit(20);

       cursor.toArray(function(err, docs) {
              assert.equal(null,err);
              response.send(docs);
        });
    });

    /**
     * @api {post} /kiwibot-simulation/user Create User
     * @apiExample {curl} Succes Create User
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/user
     * @apiGroup USER
     * @apiParam {String} name name
     * @apiParam {String} nickname nickname
     * @apiParam {String} email email
     * @apiParam {String} password password
     * @apiParam {String} confirmPassword Confirm password
     * @apiSuccess {id} _id id
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "_id":"741253876126301273asd"
     *     }
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.post('/kiwibot-simulation/user', function (request,response) {
        var name = request.body.name;
        var email = request.body.email;
        var nickname = request.body.nickname;
        var password = crypto.HmacSHA1(request.body.password, keyValue);
        var confirmPassword = crypto.HmacSHA1(request.body.confirmPassword, keyValue);

        if(name != null){
          if(nickname != null){
            if(email != null){
              if(password != null){
                if(confirmPassword != null){
                  if(password.toString() == confirmPassword.toString()){
                    if(validator.isEmail(email.toString())){
                      var insert = {"user": {
                                      "name": name,
                                      "nickname": nickname,
                                      "email": email,
                                      "password" : password.toString()
                                    },
                                    "scores" :[],
                                    "total_score":0
                                  };

                      db.collection('Users').insertOne(insert,function(error,responseInsert){
                          if(error!=null){
                            if (error.name === 'MongoError') {
                              response.status(500).send({"error":"DB Error","message":error.message});
                            }
                          }else{
                              var projection = {"_id":1,"user.name":1,"user.nickname":1,"user.email":1};
                              var querry =  {"user.email": insert.user.email};
                              var cursor =  db.collection('Users').find(querry,projection).limit(1);
                              cursor.toArray(function(err, doc) {
                                     assert.equal(null,err);
                                     response.send(doc);
                               });
                          }
                      });
                    }else{
                      response.status(400).send({"error":"is not email valid"});
                    }
                  }else{
                    response.status(400).send({"error":"Invalid credentials"});
                  }
                }else{
                  response.status(400).send({"error":"Confirm password is empty"});
                }
              }else{
                response.status(400).send({"error":"Password is empty"});
              }
            }else{
              response.status(400).send({"error":"Email is empty"});
            }
          }else{
            response.status(400).send({"error":"Nickname is empty"});
          }
        }else{
          response.status(400).send({"error":"Name is empty"});
          //response.send({"error":"Name is empty"});
        }
    });
    /**

     * @api {post} /kiwibot-simulation/user/id/:id/score Insert score
     * @apiExample {curl} Succes Score Top
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/kiwibot-simulation/user/id/:id/score
     * @apiGroup SCORES
     * @apiParam {String} score score
     * @apiParam {String} level level
     * @apiSuccess {message} message message
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "message":"Update Score"
     *     }
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.post('/kiwibot-simulation/user/id/:id/score', function (request,response) {
      var score = request.body.score;
      var level = request.body.level;
      var objectID = new mongo.ObjectID(request.params.id);
      var insert = { $addToSet: {"scores": {"score":score, "level":level}}};
      db.collection('Users').update({ "_id":  objectID},insert,function(error,responseInsert){
          if(error!=null){
              response.status(500).send({"error":"DB Error","message":error.message});
          }else{
              response.send({"message":"Succes Score Update"});
          }
      });
    });


    /**
     * @api {get} /kiwibot-simulation/user/login User Login
     * @apiExample {curl} Succes User Login
     *  curl -i https://afternoon-sea-50972.herokuapp.com/kiwibot-simulation/user/login
     * @apiGroup USER
     * @apiParam {String} password password
     * @apiParam {String} email email
     * @apiSuccess {users[]} user list user
     * @apiSuccess {String} user.name personal name of the user
     * @apiSuccess {String} user.nickname nickname of the user
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    [
     *      "user":{
     *          "name":"Carlos Zubieta",
     *          "nickname":"zubcarz",
     *          "email":"zubcarz@gmail.com"
     *      }]
     * @apiErrorExample {json} List error
     *    HTTP/1.1 500 Internal Server Error
     */
    app.post('/kiwibot-simulation/user/login', function (request,response) {
      var email = request.body.email;
      var password = crypto.HmacSHA1(request.body.password, keyValue).toString();
      var projection = {"_id":1,"user.email":1,"user.nickname":1,"user.name":1};
      var querry = {"user.email":email,"user.password" :password };
      var cursor =  db.collection('Users').find(querry,projection);

      cursor.toArray(function(err, docs) {
             assert.equal(null,err);
             response.send(docs);
             console.log(password);
       });

    });

    app.use(function(request,response){
      response.sendStatus(404);
    });

    app.listen(process.env.PORT || 3000, function(){
       console.log('Kiwibot api up and running...');
    });

  });
