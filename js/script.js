$(document).ready(function () {
  var windowWidth = $(window).width();
  var modalWidth = windowWidth > 769 ? '675px' : '72%';
  if (windowWidth > 769) {
    modalWidth = '675px';
  } else if (windowWidth > 576) {
    modalWidth = '72%';
  } else {
    modalWidth = '90%';
  }
  $('.inline').colorbox({ inline: true, width: modalWidth });

  const links = document.querySelectorAll('a.link');
  const params = new URLSearchParams(window.location.search);
  const utmCampaignParam = params.get('utm_campaign');
  if (utmCampaignParam) {
    for (let i = 0; i < links.length; i++) {
      let url = links[i].getAttribute('href');
      links[i].setAttribute('href', url + '?utm_campaign=' + utmCampaignParam);
    }
  }
});
