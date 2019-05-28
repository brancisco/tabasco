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

  namedParameterEscape(query, params) {
    for (let param in params) {
      let pattern = `:${param}`;
      if (query.search(pattern) < 0) {
        throw Error(`namedParameterEscape: Parameter "${pattern}" was not found.`);
      }
      else {
        query = query.replace(pattern, this.conn.escape(params[param]));
      }
    }
    return query;
  }

  update(slug, ptype, data, callback) {
    let query = `UPDATE blog_project SET title=:title, slug=:slug, preview_subtitle=:preview_subtitle, cover_img_link=:cover_img_link, category=:category, content=:content, type=:type, style=:style WHERE type=:where_type AND slug=:where_slug;`
    data.where_type = ptype;
    data.where_slug = slug;
    query = this.namedParameterEscape(query, data);
    this.conn.query(query,
      function (err, res, fields) {
        if (err) {
          console.log(err);
        }
        else {
          callback(res);
        }
      }
    );
  }

  article(slug, ptype, callback) {
    let query = `SELECT title, preview_subtitle, type, cover_img_link, style, content, category, slug, created, updated FROM blog_project WHERE slug = '${slug}' AND type=${ptype};`;
    let _this = this;
    this.conn.query(
      query,
      function (err, res, fields) {
        if (err) {
          console.log(err);
          callback(res, err);
        }
        _this.formatDate(res);
        if (res.length > 1) {
          throw Error('Error: There should not be more than one result. Check your SQL.')
        }
        callback(res[0]);
      }
    )
  }

  previews (options, callback) {
    options.direction = options.direction || 'ASC';
    options.category = options.category || '';
    options.limit = options.limit || 16;
    options.offset = options.offset || 0;
    options.type = options.type || 0;

    let query = `SELECT id, title, preview_subtitle, cover_img_link, category, slug, created, updated, type FROM blog_project`;
    
    if (options.type != -1) {
      query += ` WHERE type=${options.type}`
    }
    if (options.category) {
      query += ` AND category = '${options.category}'`;
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