export function _parseUrlLink(content) {
  const urlRegex = /(http(s)?:\/\/)?\w+(\.\w+)+/gi;

  const replace = (content) => {
    const convertContent = content.replace(urlRegex, function (url) {
      url = url.includes("http") ? url : "https://"+url;
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })

    const htmlArr = [];
    convertContent.split('\n').forEach(function (text) {
      const textHtml = "<p>" + text + "</p>";
      htmlArr.push(textHtml)
    })

    return {__html: htmlArr.join("")};
  }

  return (
      <div>
        <div dangerouslySetInnerHTML={replace(content)}></div>
      </div>
  )
}
