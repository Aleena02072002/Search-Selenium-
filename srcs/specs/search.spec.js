import { Builder } from "selenium-webdriver";
import assert from "assert";
import SearchPage from "../pages/searchPage.js";
import config from "../../Search/config/config.js";
export const testData = config.testData;

describe('Searching', function () {
    let driver;
    let searchPage;

    this.timeout(10000);

    before(async () => {
        driver = new Builder().forBrowser('chrome').build();
        searchPage = new SearchPage(driver);
        await searchPage.open();
    });

    after(async () => {
        await driver.quit();
    })

    it('should search successfully with valid keyword', async () => {
        await searchPage.enterKeyword(testData.validFullName.app);
        await searchPage.clickSearch();
        await searchPage.waitResult(testData.validFullName.app);
        const resultText = await searchPage.getFirstResultText();

        //check if there's result
        assert.ok(resultText, "No search results found.");
        assert.ok(
            resultText.includes(testData.validFullName.app),
            `Expected result to include '${testData.validFullName.app}', but got '${resultText}'`
        );
    })


    it('should search successfully with leading white space before keyword', async () => {
        await searchPage.enterKeyword(testData.validFullName.trimspaceTest1);
        await searchPage.clickSearch();
        console.log("search complete");
        await searchPage.waitResult(testData.validFullName.app);

        const resultText = await searchPage.getFirstResultText();
        //check if there's result
        assert.ok(resultText, "No search results found.");
        assert.ok(
            resultText.includes(testData.validFullName.app),
            `Expected result to include '${testData.validFullName.app}', but got '${resultText}'`
        );
    })

    it('should search successfully with trailing white space after keyword', async () => {
        await searchPage.enterKeyword(testData.validFullName.trimspaceTest2);
        await searchPage.clickSearch();
        await searchPage.waitResult(testData.validFullName.app);

        const resultText = await searchPage.getFirstResultText();
        //check if there's result
        assert.ok(resultText, "No search results found.");
        assert.ok(
            resultText.includes(testData.validFullName.app),
            `Expected result to include '${testData.validFullName.app}', but got '${resultText}'`
        );
    });

    it('should search successfully with valid headline keyword', async () => {
        await searchPage.enterKeyword(testData.validFullName.headline);
        await searchPage.clickSearch();
        await searchPage.waitHeadlineResult(testData.validFullName.headline);

        const resultText = await searchPage.getHeadlineTextFromResult();

        //check if there's result
        assert.ok(resultText, "No search results found.");
        assert.ok(
            resultText.includes(testData.validFullName.headline),
            `Expected result to include '${testData.validFullName.headline}', but got '${resultText}'`
        );
    })

    it('should return valid result with maximum headline word counts search(510)', async () => {
        await searchPage.enterKeyword(testData.validFullName.longHeadline);
        await searchPage.clickSearch();
        await searchPage.waitHeadlineResult(testData.validFullName.longHeadline);

        const result = await searchPage.getHeadlineTextFromResult();

        assert.ok(result, "No result found");
        assert.ok(result.includes(testData.validFullName.longHeadline),
            `Expected ${testData.validFullName.longHeadline} but got ${result}`);
    });

    it('should return no result with invalid keyword', async () => {
        await searchPage.enterKeyword(testData.invalidName.app);
        await searchPage.clickSearch();
        await searchPage.waitNoResult();

        const hasNoResults = await searchPage.hasNoResultMessage();
        assert.strictEqual(hasNoResults, true, "Expected 'No result' message to appear.");

    })

    it('should return results matching partial keyword', async () => {
        const partial = testData.partialSearch.partial;

        await searchPage.enterKeyword(partial);
        await searchPage.clickSearch();

        await driver.wait(async () => {
            const results = await searchPage.getAllResultTexts();
            return results.length > 0;
        }, 10000, `Expected at least one result for partial '${partial}'`);

        const results = await searchPage.getAllResultTexts();

        assert.ok(results.length > 0, "No results found for partial search.");

        results.forEach(text => {
            assert.ok(
                text.toLowerCase().includes(partial.toLowerCase()),
                `Result "${text}" does not contain partial keyword "${partial}"`
            );
        });
    });

    it('should return all bots and apps when no keyword is entered', async () => {
        await searchPage.enterKeyword(testData.empty.empty); // make sure it's empty
        await searchPage.clickSearch();

        // Wait until some results appear
        await driver.wait(async () => {
            const results = await searchPage.getAllResultTexts();
            return results.length > 0;
        }, 10000, "Expected full result list when searching with empty input");

        const allResults = await searchPage.getAllResultTexts();

        assert.ok(allResults.length > 0, "No results found after searching with empty input.");
        console.log("Total results returned:", allResults.length);
    });

    it('should return no result with script', async () => {
        await searchPage.enterKeyword(testData.invalidName.script);
        await searchPage.clickSearch();
        await searchPage.waitNoResult();

        const hasNoResults = await searchPage.hasNoResultMessage();
        assert.strictEqual(hasNoResults, true, "Expected 'No result' message to appear.");

    })

    it('should return no result with sql', async () => {
        await searchPage.enterKeyword(testData.invalidName.sql);
        await searchPage.clickSearch();
        await searchPage.waitNoResult();

        const hasNoResults = await searchPage.hasNoResultMessage();
        assert.strictEqual(hasNoResults, true, "Expected 'No result' message to appear.");

    })

    it('should be able to search with case insensitive', async () => {
        await searchPage.enterKeyword(testData.validFullName.caseSensitivity);
        await searchPage.clickSearch();
        await searchPage.waitResult(testData.validFullName.app);

        const result = await searchPage.getFirstResultText();
        assert.ok(result, "No bots found");
        assert.ok(
            result.includes(testData.validFullName.app),
            `Expected result to include '${testData.validFullName.app}' but get '${result}'`
        );

    })

    // 
    it('should filter bots/apps by selected tag', async function () {
        // this.timeout(20000);
        const tagToFilter = testData.validFullName.tag2;

        await searchPage.enterKeyword("");

        await searchPage.clickTagByText(tagToFilter);
        await driver.sleep(1000);
        await searchPage.waitForResultsToLoad();

        const tagLists = await searchPage.getTagsForAllResults();

        const flatTags = tagLists.flat();

        tagLists.forEach((tags, i) => {
            if (tags.length === 0) {
                console.warn(`Skipping result #${i + 1} as it has no tags`);
                return;
            }

            assert.ok(
                tags.includes(tagToFilter),
                `Result #${i + 1} does not include tag "${tagToFilter}". Got: [${tags.join(", ")}]`
            );
        });


    });

    it('should filter bots/apps by multiple selected tags (OR logic)', async () => {
        // await searchPage.clearSelectedTags();
        await driver.sleep(1000);

        const tagToFilter1 = testData.validFullName.tag1;
        const tagToFilter2 = testData.validFullName.tag2;
        const selectedTags = [tagToFilter1, tagToFilter2];

        await searchPage.clickTagByText(tagToFilter1);
        await driver.sleep(1000);
        await searchPage.clickTagByText(tagToFilter2);
        await driver.sleep(500);

        await searchPage.waitForResultsToLoad();

        const tagLists = await searchPage.getTagsForAllResults();
        const flatTags = tagLists.flat();

        tagLists.forEach((tags, i) => {
            if (tags.length === 0) {
                console.log(`Skipping result #${i + 1} as it has no tags`);
                return;

            }

            //check if the tags match at least one in the array
            const hasAtLeastOne = selectedTags.some(tag => tags.includes(tag));
            assert.ok(
                hasAtLeastOne,
                `Result ${i + 1} does not include the selected tags: [${selectedTags.join(", ")}], Got: [${tags.join(", ")}]`
            );
        });

    });

    it('should update results when a selected tag is cleared', async () => {
        // await searchPage.clearSelectedTags();
        await driver.sleep(1000);
        const tag = testData.validFullName.tag1;

        await searchPage.clickTagByText(tag);
        await driver.sleep(1000); // allow DOM update
        await searchPage.waitForResultsToLoad();

        const filteredResults = await searchPage.getTagsForAllResults();

        filteredResults.forEach((tags, i) => {
            if (tags.length === 0) return;
            assert.ok(
                tags.includes(tag),
                `Result #${i + 1} does not include tag "${tag}".`
            );
        });

        await searchPage.clickTagByText(tag); // deselect the tag
        await driver.sleep(500); // allow DOM update
        await searchPage.waitForResultsToLoad();

        const newResults = await searchPage.getTagsForAllResults();
        const someResultsHaveDifferentTags = newResults.some(tags => !tags.includes(tag));

        assert.ok(
            someResultsHaveDifferentTags,
            "Expected at least some results without the cleared tag."
        );
    });

    it('should return results matching both keyword and selected tag', async () => {
        const keyword = testData.validFullName.bot2;
        const tag = testData.validFullName.tag2;

        await searchPage.enterKeyword(keyword);
        await searchPage.clickTagByText(tag);
        await driver.sleep(500);
        await searchPage.waitForResultsToLoad();

        const resultTexts = await searchPage.getAllResultTexts(); // Implement this if needed
        const tagLists = await searchPage.getTagsForAllResults();

        resultTexts.forEach((text, i) => {
            assert.ok(
                text.includes(keyword),
                `Result #${i + 1} does not include keyword "${keyword}". Got: "${text}"`
            );
        });

        tagLists.forEach((tags, i) => {
            if (tags.length === 0) return;
            assert.ok(
                tags.includes(tag),
                `Result #${i + 1} does not include tag "${tag}".`
            );
        });
    });

    it('should return no results if keyword is valid but selected tag does not match any result', async () => {
        const keyword = testData.validFullName.bot2;
        const tag = testData.validFullName.tag3;

        await searchPage.enterKeyword(keyword);
        await searchPage.clickTagByText(tag);
        await driver.sleep(500);
        await searchPage.waitNoResult();

        const hasNoResults = await searchPage.hasNoResultMessage();
        assert.strictEqual(hasNoResults, true, "Expected 'No result' message to appear.");
    });
});