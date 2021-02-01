const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'http://www.tmon.co.kr/planning/';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  // 스크롤 가장 아래로 내려서 모든 데이터 로딩
  await autoScroll(page);

  const planList = await page.$$(
    '#planWrap > div > div > div.plan_collect_box',
  );

  let scrappedData = [];

  for (let plan of planList) {
    scrappedData.push({
      index: await plan.$eval(
        'div.plan_collect_banner > div.plan_collect_rank > span.num',
        (elem) => elem.innerHTML,
      ),
      title: await plan.$eval('div.plan_collect_banner > a > img', (elem) =>
        elem.getAttribute('alt'),
      ),
      promotionUrl: await plan.$eval('div.plan_collect_banner > a', (elem) =>
        elem.getAttribute('href'),
      ),
      imageUrl: await plan.$eval('div.plan_collect_banner > a > img', (elem) =>
        elem.getAttribute('src'),
      ),
    });
  }

  fs.writeFile(
    `../data/tmon-${new Date().getTime()}.json`,
    JSON.stringify(scrappedData, null, 2),
    (err) =>
      err
        ? console.error('[ERROR] Failed writing file.', err)
        : console.log('Successfully file created.'),
  );

  await browser.close();
})();

// 스크롤에 반응하는 사이트에서 추가적인 데이터를 얻기 위해 autoScroll 메서드 생성
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 500; // 스크롤 1회당 간격
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // 스크롤 1회당 시간 간격
    });
  });
}
