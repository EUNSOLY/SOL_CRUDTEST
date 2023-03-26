// espress 템플릿
const espress = require("express");
const app = espress();

// body-parser 템플릿
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// method 템플릿 (데이터베이스 수정하기위한)
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//mongodb 템플릿
const MongoClient = require("mongodb").MongoClient;

// mongodb 실행문
let db;
MongoClient.connect(
  "mongodb+srv://EUNSOLY:Meunsol9632!!@cluster0.2n5a39e.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) console.log(err);
    db = client.db("selfTest");
  }
);

// ejs 문법 템플릿
app.set("view engine", "ejs");

// 라우팅
app.listen(8080, function () {
  console.log("8080 서버 작독 중 ");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/input", function (req, res) {
  res.sendFile(__dirname + "/input.html");
});

app.get("/list", function (req, res) {
  db.collection("list")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { list: result });
    });
});

// 디테일 페이지( url 아이디에 맞는연결)
app.get("/detail/:id", function (req, res) {
  db.collection("list").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("detail.ejs", { date: result });
    }
  );
});

// 수정페이지로 라우터
app.get("/edit/:id", function (req, res) {
  db.collection("list").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("edit.ejs", { list: result });
    }
  );
});

// 입력form
app.post("/add", function (req, res) {
  db.collection("counter").findOne({ name: "count" }, function (err, result) {
    console.log("카운터 호출");
    let num = result.listTotal;
    console.log(num);
    db.collection("list").insertOne(
      {
        _id: num,
        할일: req.body.title,
        완료일자: req.body.date,
      },
      function (err, res) {
        console.log("데이터베이스 전송완료");
        db.collection("counter").updateOne(
          { name: "count" },
          { $inc: { listTotal: 1 } },
          function (err, result) {
            if (err) console.log(err);
            console.log("카운트 업데이트완료");
          }
        );
      }
    );
    res.redirect("/list");
  });
});

// 수정 form
app.put("/edit", function (req, res) {
  db.collection("list").updateOne(
    { _id: parseInt(req.body.id) },
    {
      $set: { 할일: req.body.title, 완료일자: req.body.date },
    },
    function (err, result) {
      if (err) console.log(err);
      res.redirect("/list");
    }
  );
});

// 삭제 라우팅
app.delete("/delete", function (req, res) {
  // console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection("list").deleteOne(req.body, function () {
    console.log("데이터삭제완료");
  });
  // res.status(200).send("데이터 삭제성공");
  res.send("데이터 삭제성공");
});
