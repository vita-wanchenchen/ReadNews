var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

module.exports = function (app) {
    // main page
    app.get('/', function (req, res) {
        // look for existing articles in database
        db.Article.find({}).sort({ timestamp: -1 }).then(function (dbArticle) {
            if (dbArticle.length == 0) {
                // if no articles found, render index
                res.render('index');
            } else {
                // if there are existing articles, show articles
                res.redirect('/articles');
            }
        }).catch(function (err) {
            res.json(err);
        });
    });

    // saved articles page
    app.get('/saved', function (req, res) {
        db.Article.find({ saved: true }).then(function (dbArticle) {
            var articleObj = { article: dbArticle };

            // render page with articles found
            res.render('saved', articleObj);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // scrape data then save to mongodb
    app.get('/scrape', function (req, res) {
        // get body of url
        axios.get('https://www.bbc.com/news/technology').then(function (response) {
            // use cheerio for shorthand selector $
            var $ = cheerio.load(response.data);

            $('.cormorant-item__body').each(function (i, element) {
                var result = {};
                var title = $(this).children('a').children('h3').children('span').text();
                console.log("title",title);
                var link = $(this).children('a').attr('href');
                console.log("link",link);
                // var summary = $(this).children('p').text();

                result.title = title;
                result.link = link;
                // result.summary = summary;
console.log ("result",result);
                // create new Article
                db.Article.create(result).then(function (dbArticle) {
                    console.log('\narticle scraped: ' + dbArticle);
                }).catch(function (err) {
                    console.log('\nerror while saving to database: ' + err);
                });
            });

            res.redirect('/articles');
        }).catch(function (error) {
            console.log('error while getting data from url: ' + error);
        });
    });

    // show articles after scraping
    app.get('/articles', function (req, res) {
        db.Article.find({}).sort({ timestamp: -1 }).then(function (dbArticle) {
            var articleObj = { article: dbArticle };

            // render page with articles found
            res.render('index', articleObj);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // save article
    app.put('/article/:id', function (req, res) {
        var id = req.params.id;

        db.Article.findByIdAndUpdate(id, { $set: { saved: true } }).then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // remove article from page 'saved'
    app.put('/article/remove/:id', function (req, res) {
        var id = req.params.id;

        db.Article.findByIdAndUpdate(id, { $set: { saved: false } }).then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // get current notes
    app.get('/article/:id', function (req, res) {
        var id = req.params.id;

        // cannot get notes associated with article, only the very first one
        db.Article.findById(id).populate('note').then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // save new note
    app.post('/note/:id', function (req, res) {
        var id = req.params.id;

        db.Note.create(req.body).then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: id
            }, {
                $push: {
                    note: dbNote._id
                }
            }, {
                new: true, upsert: true
            });
        }).then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
    });

    // delete note
    app.delete('/note/:id', function (req, res) {
        var id = req.params.id;

        db.Note.remove({ _id: id }).then(function (dbNote) {
            res.json({ message: 'note removed!' });
        }).catch(function (err) {
            res.json(err);
        });
    });
};

