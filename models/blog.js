class Blog {
  constructor(conn) {
    this.conn = conn;

    this.formatDate = (res) => {
      for (let i = 0; i < res.length; i ++) {
        if(res[i].created)
          res[i].created = res[i].created.getMonth()+1 + '/' + res[i].created.getDate() + '/' + res[i].created.getFullYear();
        if (res[i].updated)
          res[i].updated = res[i].updated.getMonth()+1 + '/' + res[i].updated.getDate() + '/' + res[i].updated.getFullYear();
      }
    };
  }

  article(slug, ptype, callback) {
    let query = `SELECT title, cover_img_link, style, content, category, slug, created, updated FROM blog_project WHERE slug = '${slug}' AND type=${ptype};`;
    let _this = this;
    this.conn.query(
      query,
      function (err, res, fields) {
        if (err) {
          console.log(err);
          callback(res, err);
        }
        _this.formatDate(res);
        callback(res);
      }
    )
  }

  previews (options, callback) {
    options.direction = options.direction || 'ASC';
    options.category = options.category || '';
    options.limit = options.limit || 16;
    options.offset = options.offset || 0;
    options.type = options.type || 0;

    let query = `SELECT title, preview_subtitle, cover_img_link, category, slug, created FROM blog_project`;
    query += ` WHERE type=${options.type}`
    if (options.category) {
      query += ` AND category = '${options.category}' `;
    }
    query += ` ORDER BY created ${options.direction} LIMIT ${options.limit} OFFSET ${options.offset}`;
    let _this = this;
    this.conn.query(
      query,
      function (err, res, fields) {
        if (err) {
          console.log(err);
        }
        _this.formatDate(res);
        callback(res);
      }
    )
  }

  categories (ptype, callback) {
    let query = `SELECT DISTINCT category from blog_project WHERE type='${ptype}';`;
    this.conn.query(
      query,
      function (err, res, fields) {
        if (err) {
          console.log(err);
        }
        callback(res);
      }
    )
  }
}

module.exports = Blog;