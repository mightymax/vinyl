var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const fs = require('fs/promises');
const { stat } = require('fs');
const { strict } = require('assert');
const cache = require('./cache');

var app = express();

app.use((req, res, next) => {
  const discogs = new (require('disconnect').Client)('Vinyl-Disconnect/1.0.0', { userToken: process.env.DISCOGS_USER_TOKEN })
  req.discogs = discogs
  next()
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const router = express.Router()
router.get([
  '/collection/:release(\\d+)',
  '/wantlist/:release(\\d+)'
], async (req, res, next) => {
  res.send(await req.discogs.database().getRelease(req.params.release))
});

router.get('/user', async (req, res, next) => {
  res.send(await req.discogs.user().getProfile(process.env.DISCOGS_USERNAME))
});

router.get('/images/:release(\\d+).jpg', async (req, res, next) => {
  const release = await req.discogs.database().getRelease(req.params.release)
  if (!release) return res.status(404).send(`release ${req.params.release} not found`)

  let url = release.images.filter(image => image.type === 'primary').shift()?.resource_url;
  if (url === undefined) {
    url = release.images.filter(image => image.type === 'secondary').shift()?.resource_url;
  }
  if (url === undefined) {
    return res.status(404).send(release)
  }
  const img = await req.discogs.database().getImage(url)
  await require('fs/promises').writeFile(`public/images/${req.params.release}.jpg`, img, 'binary')
  res.set("Content-Type", "image/jpeg");
  return res.status(200).end(img, 'binary');
});

router.get('/collection',async (req, res, next) => {
  return cache.get('collection')
    .then(cache => res.send(cache))
    .catch(async _ => 
      cache.set('collection', await req.discogs.user().collection().getReleases(process.env.DISCOGS_USERNAME, 0, {per_page:100, sort: 'added', sort_order: 'desc'}))
        .then(releases => res.send(releases))
    )
});

router.get('/wantlist', async (req, res, next) => {
  return cache.get('wantlist')
    .then(cache => res.send(cache))
    .catch(async _ => 
      cache.set('wantlist', await req.discogs.user().wantlist().getReleases(process.env.DISCOGS_USERNAME, 0, {per_page:100, sort: 'added', sort_order: 'desc'}))
        .then(wantlist => res.send(wantlist))
    )
});

/* GET home page. */
router.get([
  '/wensenlijst',
], (_req, res) => fs.readFile('public/index.html', 'utf-8')
    .then(html => res.send(html.replace("var defaultTab = 'collection'", `var defaultTab = 'wantlist'`)))
);

app.use(router)

module.exports = app;
