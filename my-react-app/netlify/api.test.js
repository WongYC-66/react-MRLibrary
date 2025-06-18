// Test local with Netlify Dev or Modify BASE_URL to hosted netlify function page

// const BASE_URL = `https://royals-library.netlify.app/api/v1`;
const BASE_URL = `http://localhost:8888/api/v1`;

export async function postToHandler(url) {
    const res = await fetch(url, {
        method: "GET",
    });
    const json = await res.json();
    return { status: res.status, json };
}

export async function runSelfTests() {
    const allTests = [
        {
            url: `${BASE_URL}/equip?id=1302000`,
            validate: json => json?.id == 1302000,
        },
        {
            url: `${BASE_URL}/equip?page=1&overallcategory=weapon&job=0&category=dagger&order=reqLevel&sort=ascending&cosmetic=null&search=maple`,
            validate: json => json?.pagination?.totalItems == 4,
        },
        {
            url: `${BASE_URL}/item?id=2000000`,
            validate: json => json?.id == 2000000,
        },
        {
            url: `${BASE_URL}/item?page=1&overallcategory=use&filter=potion&order=id&sort=ascending&search=blue`,
            validate: json => json?.pagination?.totalItems == 8,
        },
        {
            url: `${BASE_URL}/map?id=104040000`,
            validate: json => json?.id == 104040000,
        },
        {
            url: `${BASE_URL}/map?page=1&location=VictoriaIsland&search=hunting`,
            validate: json => json?.pagination?.totalItems == 4,
        },
        {
            url: `${BASE_URL}/monster?id=100100`,
            validate: json => json?.id == 100100,
        },
        {
            url: `${BASE_URL}/monster?page=1&filter=any&category=victoriaisland&order=level&sort=ascending&search=mushroom`,
            validate: json => json?.pagination?.totalItems == 8,
        },
        {
            url: `${BASE_URL}/music?name=amoria`,
            validate: json => json?.bgm == "amoria.mp3",
        },
        {
            url: `${BASE_URL}/music?page=1&search=amoria`,
            validate: json => json?.pagination?.totalItems == 2,
        },
        {
            url: `${BASE_URL}/npc?id=2002`,
            validate: json => json?.id == 2002,
        },
        {
            url: `${BASE_URL}/npc?page=1&location=victoria-island&type=all&search=instructor`,
            validate: json => json?.pagination?.totalItems == 14,
        },
        {
            url: `${BASE_URL}/quest?id=2017`,
            validate: json => json?.id == 2017,
        },
        {
            url: `${BASE_URL}/quest?page=1&location=victoria&type=all&search=arwen`,
            validate: json => json?.pagination?.totalItems == 5,
        },
        {
            url: `${BASE_URL}/skill?id=1001004`,
            validate: json => json?.id == 1001004,
        },
        {
            url: `${BASE_URL}/skill?page=1&filter=mm&order=id&sort=ascending&search=crossbow`,
            validate: json => json?.pagination?.totalItems == 5,
        },
    ]

    console.log(`Running ${allTests.length} self-tests...\n`);

    let pass = 0;
    let results = allTests.map(async ({ url, validate }) => {
        let res = null
        try {
            const { status, json } = await postToHandler(url);
            if (status !== 200) {
                res = (`❌ ${url} → HTTP ${status}`);
            } else if (!validate(json)) {
                res = (`❌ ${url} → Validation failed`);
            } else {
                res = (`✅ ${url}`);
                pass++;
            }
        } catch (err) {
            res = (`❌ ${url} → ${err.message}`);
        }
        // console.log(res)
        return res
    })

    results = await Promise.all(results)

    console.log(results)
    console.log(`\n✅ Passed ${pass}/${allTests.length} tests`);

    return results
}

// Run -> node ./api.test.js
runSelfTests()