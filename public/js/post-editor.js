function apiRequest(url, method, data, fnSucc, fnFail) {
  $.ajax({
    method: method,
    url: url,
    data: data
  })
  .done(fnSucc)
  .fail(fnFail);
}

function updatePreview() {
  let req = {
    title: $('#title').val(),
    style: $('#style').val(),
    cover_img_link: $('#cover_img').val(),
    content: $('#tabasco_editor').val(),
  }
  apiRequest('/api/preview-generator', 'POST',
    req,
    function(response) {
      $('#render_container').html(response);
    }
  );
}

function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}

let apiUri = window.location.pathname.split('/').slice(-2).reduce(
  (acc, c) => acc + '/' + c
)

apiRequest(`/api/${apiUri}`, 'GET', undefined,
  function (data) {
    console.log(data)
    $('#tabasco_editor').val(data.content);
    $('#title').val(data.title);
    $('#preview_title').val(data.preview_subtitle);
    $('#slug').val(data.slug);
    $('#category').val(data.category)
    $('#style').val(data.style);
    $('#type').val(data.type);
    $('#cover_img').val(data.cover_img_link);
    updatePreview();
  }
)

function saveArticle() {
  let req = {
    content: $('#tabasco_editor').val(),
    title: $('#title').val(),
    preview_subtitle: $('#preview_title').val(),
    slug: $('#slug').val(),
    category: $('#category').val(),
    style: $('#style').val(),
    type: $('#type').val(),
    cover_img_link: $('#cover_img').val()
  }
  apiRequest(`/api/${apiUri}`, 'PUT',
    req,
    function(response) {
      console.log(response);
    }
  );
}

$(document).ready(function() {
  $('#tabasco_editor').keyup(delay(
    updatePreview, 2000
  ));
});