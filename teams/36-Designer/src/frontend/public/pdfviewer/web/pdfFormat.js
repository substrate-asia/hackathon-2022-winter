function PdfFormat(){
    window.haveShowPageList = '';
    window.gotoPageFrom = function (page) {
        PDFViewerApplication.pdfLinkService.goToPage(page);
    };
    window.displaySignature = function () {
        var currentPages = $('[data-page-number="' + PDFViewerApplication.page + '"]');
        var signatureLen = $('.base64-wrap').length;
        if ($(`#page-mask-${signatureLen}`).length > 0) return;
        $(currentPages[1]).append(`<div class="page-mask" id="page-mask-${signatureLen}"><img class="page-mask-del" id="page-mask-del-${signatureLen}" src="images/del.svg" /></div>`);
        $(`#page-mask-del-${signatureLen}`).on('click', function () {
            $(`#page-mask-${signatureLen}`).remove();
            return false;
        });
        $(`#page-mask-${signatureLen}`).on('click', function (e) {
            e.stopPropagation();

            if ($(`#signature-${signatureLen}`).length) {
                return;
            }
            var $this = $(this);
            $(this).append(`
            <div class="signature-wrap" id="signature-wrap-${signatureLen}">
              <img class="signature-del" id="signature-del-${signatureLen}" src="images/del.svg" />
              <img class="signature-save" id="signature-save-${signatureLen}" src="images/ok.svg" />
               <input type="text" id="signature-${signatureLen}" autocomplete="off" />
            </div>`);
            $(`#signature-wrap-${signatureLen}`).css({
                left: e.offsetX + 'px',
                top: e.offsetY + 'px'
            });
            $(`#signature-save-${signatureLen}`).on('click', function () {
                var base64 = $(`#signature-${signatureLen}`).val();
                $(`#page-mask-${signatureLen}`).remove();
                $(currentPages[1]).append(`
              <div class="base64-wrap" id="base64-wrap-${signatureLen}">
                <img class="signature-remove" id="signature-remove-${signatureLen}" src="images/del.svg" />
                <div class="signature-show">${base64}</div>
              </div>`);
                console.log(e.offsetX, e.offsetY);
                $(`#base64-wrap-${signatureLen}`).css({
                    left: e.offsetX + 'px',
                    top: e.offsetY + 'px'
                });
                $(`#base64-wrap-${signatureLen}`).Tdrag({
                    scope: '.page',
                    cbEnd: function () {
                        // window.signatureList[signatureLen-1].left = parseInt($(`#base64-wrap-${signatureLen}`).css('left'));
                        // window.signatureList[signatureLen-1].top = parseInt($(`#base64-wrap-${signatureLen}`).css('top'));
                        let obj = window.signatureList.find((item) => item.index === signatureLen)
                        if (obj) {
                            obj.left = parseInt($(`#base64-wrap-${signatureLen}`).css('left'));
                            obj.top = parseInt($(`#base64-wrap-${signatureLen}`).css('top'));
                        }
                    }
                });
                $(`#signature-remove-${signatureLen}`).on('click', function () {
                    $(`#base64-wrap-${signatureLen}`).remove();
                    window.signatureList = window.signatureList.filter((item) => signatureLen !== item.index)
                    // window.signatureList.splice(signatureLen, 1);
                    window.parent.signatureList = window.signatureList;
                    window.parent.getSignatureList && window.parent.getSignatureList(window.signatureList);
                });

                if (!window.signatureList) {
                    window.signatureList = [];
                }

                window.signatureList.push({
                    left: e.offsetX,
                    top: e.offsetY,
                    base64: base64,
                    index:signatureLen,
                    page: PDFViewerApplication.page
                });
                window.parent.signatureList = window.signatureList;
                window.parent.getSignatureList && window.parent.getSignatureList(window.signatureList);
                return false;
            });
            $(`#signature-del-${signatureLen}`).on('click', function () {
                $(`#signature-wrap-${signatureLen}`).remove();
                return false;
            });
        });
    };

    window.showHaveSignedList = function (page) {
        var parentTimer = setInterval(() => {
            if (window.haveSignedList?.length) {
                clearInterval(parentTimer);
                var haveSignedList = window.haveSignedList || [];
                var haveShowPageList = window.haveShowPageList || '';

                if (haveShowPageList.indexOf(page) > -1) {
                    return;
                }

                window.haveShowPageList = haveShowPageList += page;
                var nowPages = $('[data-page-number="' + page + '"]');
                haveSignedList.forEach(function (haveSignd, index) {
                    if (haveSignd.page === page) {
                        var signatureLen = $('.base64-wrap').length;
                        $(nowPages[1]).append(`
                  <div class="base64-wrap" id="base64-wrap-${signatureLen}">
                     <div class="base64 signature-show" id="js-base64-${signatureLen}">${haveSignd.base64}</div>
                  </div>`);
                        $(`#base64-wrap-${signatureLen}`).css({
                            left: haveSignd.left + 'px',
                            top: haveSignd.top + 'px'
                        });
                    }
                });
                // window.finishList = window.haveSignedList;
                // window.parent.finishList = window.finishList;
                // window.parent.getFinishList && window.parent.getFinishList(window.haveSignedList);
            }
        }, 100);
    };


}