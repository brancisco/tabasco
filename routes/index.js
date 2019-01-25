var express = require('express');
var router = express.Router();
const pug = require('pug');
const Blog = require('../models/blog.js'); 

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const links = {
  'home': '/',
  'about': '/about',
  'blog': '/blog',
  'projects': '/projects',
  'linkedin': 'https://www.linkedin.com/in/brandon-aguirre-75660595/',
  'github': 'https://github.com/brancisco',
}

var coverPageData = {
  name: 'Brandon Aguirre',
  portrait: {
    img_src: '/images/me.jpg',
    alt: 'Portrait of Brandon Aguirre'
  },
  tagline: 'Computer Science',
  location: 'CO, Boulder',
  panel_items: [
    {
      title      : 'Projects',
      href       : links.projects,
      description: 'some stuff ive worked on'
    },
    {
      title      : 'Thoughts',
      href       : links.blog,
      description: 'some of them are even original'
    },
    {
      title      : 'About',
      href       : links.about,
      description: 'find out more about me'
    },
  ],
  cover_page_links: [
    {
      href   : links.github,
      img_src: '/images/github-logos/PNG/GitHub-Mark-64px.png',
      alt    : 'Link to Brandon\'s GitHub'
    },
    {
      href   : links.linkedin,
      img_src: '/images/linked-in-logos/Black/In-Black-54px-TM.png',
      alt    : 'Link to Brandon\'s LinkedIn'
    }
  ],
}
coverPageData.links = links

/* GET home page. */
router.get('/', function(req, res, next) {
  coverPageData.name = 'Brandon Aguirre'
  res.render('index', coverPageData);
});

router.get('/about', function(req, res, next) {
  coverPageData.name = 'About Me'
  res.render('about', coverPageData);
});

function loadPreviewPage (locals, req, res, next) {
  let direction = 'ASC';
  let category = '';
  let ptype = 0;
  if (req.params.sortby == undefined || req.params.sortby == 'newest') {
    direction = 'DESC';
  }

  if (req.params.category) {
    category = req.params.category;
  }
  let re = /^\/projects*/
  if (re.test(req.url)) {
    ptype = 1;
  }

  const blog = new Blog(connection);
  blog.categories(ptype, function (categories) {
    categories = categories.map((obj) => obj.category).
      filter((cat) => {return cat != null});
    blog.previews({
        direction: direction,
        category: category,
        type: ptype // type 0=blog
      },
      function (previews) {
        locals.items = previews;
        locals.categories = categories;
        res.render('blog', locals);
      });
    }
  );
}

router.get('/blog(/sort/:sortby(newest|oldest)/?(category/:category)?)?', function(req, res, next) {
  console.log(req.url);
  let locals = {
    name: 'Blog',
    bannerHeader: 'A collection of my thoughts on all things computer science.',
    page: 'blog',
    itemPage: 'blog-post',
    links: links,
    sortby: req.params.sortby ? req.params.sortby : 'newest',
    category: req.params.category ? req.params.category : '',
  }
  loadPreviewPage(locals, req, res, next);
});

router.get('/blog-post/:slug', function(req, res, next) {

  const blog = new Blog(connection);
  blog.article(req.params.slug, 0,
    function (article, err=undefined) {
      if (err) {
        res.render('error', {
          message: 'Sorry, The blog post you are looking for doesn\'t seem to exist.',
          error: err
        });
      }
      else if (article.length < 1) {
        res.render('error', {
          message: 'Sorry, The blog post you are looking for doesn\'t seem to exist.',
          error: {status: 404, stack: 'No articles came back with the slug entered'},
        });
      }
      else {
        article[0].content = pug.render(article[0].content);
        res.render('blog-post', {
          article: article[0],
          links: links,
        });
      }
    }
  );
});

router.get('/projects(/sort/:sortby(newest|oldest)/?(category/:category)?)?', function(req, res, next) {
  let locals = {
    name: 'Projects',
    bannerHeader: 'A collection of projects I\'ve worked on.',
    page: 'projects',
    itemPage: 'project-page',
    links: links,
    sortby: req.params.sortby ? req.params.sortby : 'newest',
    category: req.params.category ? 'category/'+req.params.category : ''
  }
  loadPreviewPage(locals, req, res, next);
});

router.get('/project-page/:slug', function(req, res, next) {
  const blog = new Blog(connection);
  blog.article(req.params.slug, 1,
    function (article, err=undefined) {
      if (err) {
        res.render('error', {
          message: 'Sorry, The project you are looking for doesn\'t seem to exist.',
          error: err
        });
      }
      else if (article.length < 1) {
        res.render('error', {
          message: 'Sorry, The project you are looking for doesn\'t seem to exist.',
          error: {status: 404, stack: 'No projects came back with the slug entered'},
        });
      }
      else {
        article[0].content = pug.render(article[0].content);
        res.render('blog-post', {
          article: article[0],
          links: links,
        });
      }
    }
  );
});

router.get('/styleguide', function(req, res, next) {
  res.render('styleguide', {});
});

module.exports = router;
