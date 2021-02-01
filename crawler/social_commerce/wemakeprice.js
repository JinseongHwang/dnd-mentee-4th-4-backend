const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://front.wemakeprice.com/promotions/main';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  // 프로모션 페이지가 로딩될 때까지 대기
  await page.waitForSelector('#_contents > div > div.promotion_list > ul');

  const promotionList = await page.$$(
    '#_contents > div > div.promotion_list > ul > li',
  ); // 프로모션 리스트 추출: Promise

  let scrappedData = [];

  for (let promotion of promotionList) {
    scrappedData.push({
      index: await promotion.$eval('a[data-gtm-index]', (card) =>
        card.getAttribute('data-gtm-index'),
      ),
      title: getTitle(
        await promotion.$eval('a[data-gtm-label]', (card) =>
          card.getAttribute('data-gtm-label'),
        ),
      ),
      promotionUrl: appendHttps(
        await promotion.$eval('a[href]', (card) => card.getAttribute('href')),
      ),
      imageUrl: await promotion.$eval('img[src]', (img) =>
        img.getAttribute('src'),
      ),
    });
  }

  fs.writeFile(
    `../data/wemakeprice-${new Date().getTime()}.json`,
    JSON.stringify(scrappedData, null, 2),
    (err) =>
      err
        ? console.error('[ERROR] Failed writing file.', err)
        : console.log('Successfully file created.'),
  );

  await browser.close();
})();

const httpsPrefix = 'https:';

function appendHttps(url) {
  if (url.indexOf(httpsPrefix) === -1) {
    // 접두사 'https:' 가 없는 URL일 경우
    return httpsPrefix + url;
  }
  return url; // 정상적인 URL일 경우
}

function getTitle(raw) {
  return raw.substr(raw.indexOf('_') + 1);
}
