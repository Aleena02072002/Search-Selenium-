import { By, until } from "selenium-webdriver";
import { BasePage } from "../../utils/base.js";
import config from "../../config/config.js";

export default class SearchPage extends BasePage {

    constructor(driver) {
        super(driver);

        this.searchInput = By.xpath("//input[@placeholder = 'Search']");
        this.searchBtn = By.css("button[type = 'Submit']");
        this.searchResult = By.xpath("//h4[contains(@class, 'ant-typography')]");
        this.noResult = By.xpath("//h4[contains(text(), 'No result')]");
        this.headline = By.xpath("//div[contains(@class,'text-gray-700') and contains(@class,'break-words')]");
        this.type = By.css('[data-e2e = "selectType"]');
        this.sort = By.css('[data-e2e = "selectSortOptions"]');
        this.pagination = By.css('[data-e2e = "selectPageOptions"]');
        this.paginationNext = By.xpath(
            `//li[@title="Next Page" and not(contains(@class, "ant-pagination-disabled"))]//button`
        );


    }

    async open() {
        await super.open(config.baseUrl);
    }

    async enterKeyword(keyword) {
        await this.input(this.searchInput, keyword);
    }

    async clickSearch() {
        await this.click(this.searchBtn);
    }

    async getFirstResultText() {
        await this.driver.wait(until.elementLocated(this.searchResult), 5000);
        const element = await this.driver.findElement(this.searchResult);

        return await element.getText();
    }


    async waitResult(expectedText) {
        await this.driver.wait(until.elementLocated(this.searchResult), 10000);
        await this.driver.wait(async () => {
            const elements = await this.driver.findElements(this.searchResult);
            if (elements.length === 0) return false;
            const text = await elements[0].getText();
            const trimmed = text.trim();
            return trimmed.includes(expectedText);
        }, 10000, `Expected result "${expectedText}" not found in time.`);
    }

    async waitHeadlineResult(expectedText) {
        await this.driver.wait(until.elementLocated(this.headline), 10000);
        await this.driver.wait(async () => {
            const elements = await this.driver.findElements(this.headline);
            if (elements.length === 0) return false;
            const text = await elements[0].getText();
            return text.includes(expectedText);
        }, 10000, `Expected result "${expectedText}" not found in time.`);
    }
    async waitNoResult() {
        await this.driver.wait(until.elementLocated(this.noResult), 5000);
    }

    async hasNoResultMessage() {
        try {
            const el = await this.driver.findElement(this.noResult);
            return await el.isDisplayed();
        } catch {
            return false;
        }
    }

    async getAllResultTexts() {
        await this.driver.sleep(500);
        const elements = await this.driver.findElements(this.searchResult);
        const texts = [];

        for (let el of elements) {
            const text = await el.getText();
            texts.push(text);
        }

        return texts;
    }

    async clickTagByText(tagName) {
        const tagElement = await this.driver.wait(
            until.elementLocated(By.xpath(`//span[contains(@class, 'ant-tag') and normalize-space(text()) = '${tagName}']`)),
            5000
        );
        const freshTagElement = await this.driver.findElement(By.xpath(`//span[contains(@class, 'ant-tag') and normalize-space(text()) = '${tagName}']`));
        await this.driver.wait(until.elementIsVisible(freshTagElement), 5000);
        await freshTagElement.click();
    }

    async selectTag(tagName) {
        await this.clickTagByText(tagName);
    }


    async waitForResultsToLoad(tagText = null) {
        const resultCardLocator = By.css("div.flex.flex-col.gap-3");
        await this.driver.wait(until.elementsLocated(resultCardLocator), 10000);

        if (tagText) {
            const tagLocator = By.xpath(`//span[contains(@class, 'ant-tag') and normalize-space(text()) = '${tagText}']`);

            // Wait until *at least one* tag with that text is found and visible
            await this.driver.wait(until.elementLocated(tagLocator), 10000);
            const tagElement = await this.driver.findElement(tagLocator);
            await this.driver.wait(until.elementIsVisible(tagElement), 10000);
        }
    }

    async getTagsForAllResults() {
        const containerLocator = By.css("div.flex.flex-col.gap-3");
        await this.driver.wait(until.elementsLocated(containerLocator), 10000);
        const getFreshContainers = () => this.driver.findElements(containerLocator);

        const allTags = [];

        const containers = await getFreshContainers();
        const containerCount = containers.length;

        for (let i = 0; i < containerCount; i++) {
            try {
                const freshContainers = await getFreshContainers(); // Re-fetch in each loop
                const container = freshContainers[i];

                const tagWrappers = await container.findElements(By.css(".flex-wrap.gap-2"));
                if (tagWrappers.length === 0) {
                    console.warn(`No tag block found in result #${i + 1}`);
                    allTags.push([]);
                    continue;
                }

                const tagElements = await tagWrappers[0].findElements(By.css("span.ant-tag"));
                const tags = [];
                for (const tagEl of tagElements) {
                    const text = await tagEl.getText();
                    tags.push(text.trim());
                }

                allTags.push(tags);
            } catch (err) {
                console.warn(`Skipped result #${i + 1} due to error:`, err.message);
                allTags.push([]);
            }
        }

        return allTags;
    }


    async getHeadlineTextFromResult() {
        await this.driver.wait(until.elementLocated(this.headline), 5000);
        const headline = await this.driver.findElement(this.headline);

        return await headline.getText();
    }


    async clearSelectedTags(tagList) {
        for (const tagName of tagList) {
            try {
                const tagLocator = By.xpath(`//span[contains(@class, 'ant-tag') and normalize-space(text()) = '${tagName}']`);

                const tagElement = await this.driver.wait(until.elementLocated(tagLocator), 5000);
                const visibleTag = await this.driver.findElement(tagLocator);

                await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", visibleTag);
                await this.driver.wait(until.elementIsVisible(visibleTag), 5000);
                await this.driver.sleep(300);

                await visibleTag.click();
                await this.driver.sleep(300);
            } catch (err) {
                console.warn(`Could not clear tag "${tagName}":`, err.message);
            }
        }
    }

    async selectType(typeName) {
        const dropdown = await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(this.type)
        ), 5000);
        await dropdown.click();
        const option = await this.driver.findElement(By.xpath(`//div[@title="${typeName}"]`));
        await option.click();
    }

    async getToolTypesFromAllResults() {
        const resultCards = await this.driver.findElements(By.css("div.flex.flex-col.md\\:flex-row.items-start")); // outer card

        const types = [];
        for (const card of resultCards) {
            try {
                const typeElement = await card.findElement(
                    By.css('span.ant-tag.!border-primary-hover.!text-primary-hover.!bg-white')
                );
                const typeText = await typeElement.getText();
                types.push(typeText.trim().toLowerCase()); // normalize to lowercase for comparison
            } catch (err) {
                types.push(null); // fallback in case a card is missing the type
            }
        }
        return types;
    }


    async selectPaginationSize(sizeText) {

        const dropdown = await this.driver.wait(until.elementLocated(this.pagination), 5000);
        await this.driver.wait(until.elementIsVisible(dropdown), 5000);
        await dropdown.click();

        // Wait for dropdown options to be in the DOM
        await this.driver.sleep(300);


        const optionXPath = `//div[@class="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50" or contains(@class, "cursor-pointer")]//span[text()="${sizeText}"]`;

        const option = await this.driver.wait(until.elementLocated(By.xpath(optionXPath)), 5000);
        await this.driver.wait(until.elementIsVisible(option), 5000);

        await option.click();

        // Wait for dropdown to disappear and results to reload
        await this.driver.sleep(500);
        await this.waitForResultsToLoad();
    }

    async selectSortOption(optionText) {
        const dropdown = await this.driver.findElement(this.sort);
        await this.driver.wait(until.elementIsVisible(dropdown), 5000);
        await dropdown.click();

        const optionLocator = By.xpath(`//div[contains(@class, "cursor-pointer")]//span[contains(text(), "${optionText}")]`);
        const option = await this.driver.wait(until.elementLocated(optionLocator), 5000);
        await this.driver.wait(until.elementIsVisible(option), 5000);

        await option.click();
        await this.waitForResultsToLoad();
    }

    async getCreationDatesFromAllResults() {
        const cards = await this.driver.findElements(By.css("div.flex.flex-col.md\\:flex-row.items-start"));
        const dates = [];

        for (const card of cards) {
            try {
                const dateEl = await card.findElement(By.css("div.text-sm.text-gray-500"));
                const dateText = await dateEl.getText(); 
                const match = dateText.match(/\d{4}-\d{2}-\d{2}/);
                if (match) {
                    dates.push(new Date(match[0]));
                }
            } catch {
                dates.push(null);
            }
        }

        return dates;
    }

}

