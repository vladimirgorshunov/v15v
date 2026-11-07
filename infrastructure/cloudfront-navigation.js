/* exported handler */
function handler(event) {
  const request = event.request
  const uri = request.uri

  if (uri === '/about' || uri === '/about/') {
    const pairs = []
    const query = request.querystring || {}
    for (const key in query) {
      const values = query[key].multiValue || [query[key]]
      for (const value of values) {
        pairs.push(key + '=' + value.value)
      }
    }
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: '/' + (pairs.length ? '?' + pairs.join('&') : '') },
      },
    }
  }

  if (uri === '/') {
    request.uri = '/index.html'
  } else if (uri === '/404' || uri === '/404/') {
    request.uri = '/404/index.html'
  } else {
    const asset = /^\/(?:assets|_build|static)(?:\/|$)/.test(uri)
    const blog = uri === '/blog' || uri.indexOf('/blog/') === 0
    const fileName = uri.substring(uri.lastIndexOf('/') + 1)
    if (!asset && (blog || fileName.indexOf('.') === -1)) {
      request.uri = '/_shell.html'
    }
  }

  return request
}
