const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.gmarket.co.kr/';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  // 기획전 페이지 보기('+' 버튼 클릭)
  await page.$eval('button.button__more', (btn) => btn.click());

  // 기획전 목록 가져오기
  const promotionList = await page.$$(
    'div.section__all-promotion > div > ul > li',
  );

  let totalIndex = 1;
  let scrappedData = [];

  // 각 기획전 element에서 필요한 데이터 추출
  for (let promotion of promotionList) {
    scrappedData.push({
      index: totalIndex++,
      title: await promotion.$eval('a > div > img', (elem) =>
        elem.getAttribute('alt'),
      ),
      promotionUrl: await promotion.$eval('a', (elem) =>
        elem.getAttribute('href'),
      ),
      imageUrl: await promotion.$eval('a > div > img', (elem) =>
        elem.getAttribute('src'),
      ),
    });
  }

  // JSON 형태로 가공
  fs.writeFile(
    `../data/gmarket-${new Date().getTime()}.json`,
    JSON.stringify(scrappedData, null, 2),
    (err) =>
      err
        ? console.error('[ERROR] Failed writing file.', err)
        : console.log('Successfully file created.'),
  );

  await browser.close();
})();