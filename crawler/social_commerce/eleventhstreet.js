const puppeteer = require('puppeteer');
const fs = require('fs');

const categories = [
  { index: '01', type: '브랜드패션' },
  { index: '02', type: '의류' },
  { index: '03', type: '잡화' },
  { index: '04', type: '뷰티' },
  { index: '05', type: '식품' },
  { index: '06', type: '유아동' },
  { index: '07', type: '가구' },
  { index: '08', type: '생활용품' },
  { index: '09', type: '레저/자동차' },
  { index: '10', type: '디지털/가전' },
  { index: '11', type: '도서/여행/취미' },
  { index: '12', type: '해외직구' },
  { index: '13', type: '홈&카서비스' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  let totalIndex = 1;
  let scrappedData = [];

  // 카테고리 별 페이지 모두 탐색
  for (let currCategory of categories) {
    let currPageNum = 1;
    const startUrl = getUrl(currCategory.index, currPageNum);
    await page.goto(startUrl);

    let lastPageNum; // 현재 카테고리가 여러 페이지로 구성되어 있을 경우 마지막 페이지 번호를 저장.
    try {
      // 여러 페이지일 경우
      lastPageNum = getNumber(
        await page.$eval(
          '#layBody > div.product_list_box_v2 > div.s_paging > a.last',
          (elem) => elem.getAttribute('onclick'),
        ),
      );
    } catch (err) {
      // 단일 페이지일 경우
      lastPageNum = 1;
    }

    // 현재 카테고리의 모든 페이지를 순회하면서 데이터 수집
    for (currPageNum = 1; currPageNum <= lastPageNum; currPageNum++) {
      const URL = getUrl(currCategory.index, currPageNum);
      await page.goto(URL);

      const planList = await page.$$(
        '#layBody > div.product_list_box_v2 > div.inner_box > ul.list_box > li',
      );

      for (let plan of planList) {
        scrappedData.push({
          index: totalIndex++,
          title: await plan.$eval('div.banner_box > h3 > a > img', (elem) =>
            elem.getAttribute('alt'),
          ),
          promotionUrl: getCompleteUrl(
            await plan.$eval('div.banner_box > h3 > a', (elem) =>
              elem.getAttribute('href'),
            ),
          ),
          imageUrl: await plan.$eval('div.banner_box > h3 > a > img', (elem) =>
            elem.getAttribute('src'),
          ),
          category: currCategory.type,
        });
      }
    }
  }

  fs.writeFile(
    `../data/eleventhstreet-${new Date().getTime()}.json`,
    JSON.stringify(scrappedData, null, 2),
    (err) =>
      err
        ? console.error('[ERROR] Failed writing file.', err)
        : console.log('Successfully file created.'),
  );

  await browser.close();
})();

function getUrl(index, page) {
  return `https://www.11st.co.kr/plan/front/displays/${index}?pageNo=${page}`;
}

// 문자열에서 숫자를 추출하는 함수
function getNumber(method) {
  let num = '';
  for (let ch of method) {
    if (!isNaN(ch)) {
      num += ch;
    }
  }
  return Number(num);
}

function getCompleteUrl(url) {
  return 'http://www.11st.co.kr/' + url;
}
