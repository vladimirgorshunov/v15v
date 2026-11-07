/* exported handler */
function handler(event) {
  const request = event.request
  const uri = request.uri

  if (uri === '/about' || uri === '/about/') {
    const pairs = []
    const query = request.querystring || {}
    // CloudFront supports ES5 iteration, not for...of.
    Object.keys(query).forEach(function (key) {
      const values = query[key].multiValue || [query[key]]
      values.forEach(function (value) {
        pairs.push(key + '=' + value.value)
      })
    })
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: '/' + (pairs.length ? '?' + pairs.join('&') : '') },
      },
    }
  }

  return request
}
