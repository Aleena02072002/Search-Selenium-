const config = {
    //Browser configuration

    browser: process.env.BROWSER || "chrome",
    headless: process.env.HEADLESS === "true",

    // Timeouts
    implicitWait: 10000,
    explicitWait: 15000,
    pageLoadTimeout: 30000,

    // URLs
    baseUrl: "https://top.nccsoft.vn/",

    // Test data

    testData: {

        validFullName: {
            app: "Live Cartoon",
            bot: "Schwarzes Loch",
            bot2: "Regenschirm 1",
            caseSensitivity: "LIVE CARTOON",
            headline: "Phänomene und Effekte",
            trimspaceTest1: "   Live Cartoon",
            trimspaceTest2: "Live Cartoon   ",
            longHeadline: "Die Quantenphysik umfasst alle Phänomene und Effekte, die darauf beruhen, dass bestimmte Größen nicht jeden beliebigen Wert annehmen können, sondern nur feste, diskrete Werte (siehe Quantelung). Die Quantenphysik umfasst alle Phänomene und Effekte, die darauf beruhen, dass bestimmte Größen nicht jeden beliebigen Wert annehmen können, sondern nur feste, diskrete Werte (siehe Quantelung).Die Quantenphysik umfasst alle Phänomene und Effekte, die darauf beruhen, dass bestimmte Größen nicht jedenaaaaaaaaaaaaaa",
            tag1: "Gaming",
            tag2: "AI",
            tag3: "Finance",
        },

        invalidName: {
            bot: "Schawsz",
            app: "Lives Kartoon",
            sql: "' OR '1'='1",
            script: "<script>alert(XSS)</script>"
        },

        partialSearch: {
            partial: "s",
        },

        empty: {
            empty: ""
        },

    },

    pagination: {
        fivePerPage: "5 bots/page",
        tenPerPage: "10 bots/page",
        fifteenPerPage: "15 bots/page"
    },

    botAppType: {
        allTypes: "All Types",
        bot: "Bot",
        app: "App"
    },

    sort: {
        dateSortFromNewest: "Date Created (Newest → Oldest)",
        dateSortFromOldest: "Date Created (Oldest → Newest)",
        nameFromA: "Name (A–Z)",
        namefromZ: "Name (Z–A)",
        dateUpdateFromNewest: "Date Updated (Newest → Oldest)",
        dateUpdateFromOldest: "Date Updated (Oldest → Newest)"
    }

}

export default config;
export const testData = config.testData;
export const botAppType = config.botAppType;
export const page = config.page;