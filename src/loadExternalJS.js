function loadExternalJS() {
  // 필요한 파일들을 동적으로 생성해줍니다.
  const scriptJquery = document.createElement("script");
  scriptJquery.src = "https://code.jquery.com/jquery-3.2.1.min.js";
  scriptJquery.async = true;

  // 생성된 script 요소들을 body에 붙여주세요
  document.body.appendChild(scriptJquery);
}

export default loadExternalJS;
