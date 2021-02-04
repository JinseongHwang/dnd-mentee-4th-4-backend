const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.coupang.com/np/exhibition/ALL';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  // 기획전 목록 가져오기
  const promotionList = await page.$$('ul#productList > li');

  let totalIndex = 1;
  let scrappedData = [];

  for (let promotion of promotionList) {
    scrappedData.push({
      index: totalIndex++,
      title: 'untitled',
      promotionUrl: getCompleteUrl(
        await promotion.$eval('a', (elem) => elem.getAttribute('href')),
        1,
      ),
      imageUrl: getCompleteUrl(
        await promotion.$eval('a > img', (elem) => elem.getAttribute('src')),
        2,
      ),
    });
  }
  
  fs.writeFile(
    `../data/coupang-${new Date().getTime()}.json`,
    JSON.stringify(scrappedData, null, 2),
    (err) =>
      err
        ? console.error('[ERROR] Failed writing file.', err)
        : console.log('Successfully file created.'),
  );

  await browser.close();
})();

const httpsPrefix = 'https:';
const coupangSourceUrl = httpsPrefix + '//www.coupang.com';

function getCompleteUrl(url, type) {
  if (url.indexOf(httpsPrefix) === -1) {
    if (type === 1) {
      // 1 : 'PROMOTION'
      return coupangSourceUrl + url;
    } else {
      // type === 2 : 'IMAGE'
      return httpsPrefix + url;
    }
  }
  return url;
}
