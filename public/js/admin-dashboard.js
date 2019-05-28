function apiGETData(fnSucc, fnFail) {
  $.ajax({
    method: "GET",
    url: "/api/posts",
  })
  .done(fnSucc)
  .fail(fnFail);
}

function setWindowLocation(page) {
  let protocol = window.location.protocol;
  let host = window.location.host;
  window.location = `${protocol}//${host}/${page}`;
}

function appendDataToTable(data) {
  console.log(data)
  let items = ['id', 'cover_img_link', 'created', 'updated', 'title', 'type'];
  let i = 0;
  for (let row of data._embedded.posts) {
    let html = '';
    for (let item of items) {
      let tdInner = row[item];
      if (item == 'cover_img_link') {
        tdInner = `<img class='table-avatar' src='${tdInner}'>`
      }
      html += `<td>${tdInner}</td>`
    }
    let tr = $('<tr>').html(html);
    if (i == data._embedded.posts.length-1) {
      tr.addClass('bookend')
    }
    tr.click( function () {
      setWindowLocation(`admin/post-editor/${row.type}s/${row.slug}`);
    });
    $('#posts_table tbody').append(tr);
    i++;
  }
}

apiGETData(
  function(data) {
    appendDataToTable(data);
  },
  function(data) { console.log('Error:'); console.log(data); }
)