(function init(screenRatioByDesign = 16 / 9) {
  console.log(screenRatioByDesign);
  let docEle = document.documentElement
  function setHtmlFontSize() {
    // const screenRatio = docEle.clientWidth / docEle.clientHeight;
    // var fontSize = (
    //   screenRatio > screenRatioByDesign
    //     ? (screenRatioByDesign / screenRatio)
    //     : 1
    // ) * docEle.clientWidth / 10;
    let fontSize = docEle.clientWidth / 10;

    // if (fontSize > 192) {
    //   fontSize = 192
    // }else 
    if (fontSize < 75) {
      fontSize = 75
    }
    docEle.style.fontSize = fontSize.toFixed(3) + "px";
  }
  setHtmlFontSize()
  window.addEventListener('resize', setHtmlFontSize)
})()