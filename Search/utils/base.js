import { until, Key } from "selenium-webdriver";

export class BasePage {

    constructor(driver) {
        this.driver = driver;
    }

    async open(url) {
        await this.driver.get(url);
    }

    async waitUntilVisible(locator, timeout = 5000) {
        const element = await this.driver.wait(until.elementLocated(locator), timeout);
        await this.driver.wait(this.elementIsVisible(element), timeout);
        return element;
    }

    async click(locator) {
        const element = await this.driver.wait(until.elementLocated(locator));
        await element.click();
    }

    async input(locator, text) {
        const element = await this.driver.wait(until.elementLocated(locator), 5000);
        await element.sendKeys(Key.CONTROL, "a");  // Select all text
        await element.sendKeys(Key.BACK_SPACE);    // Delete it
        await element.sendKeys(text);
    }

    // async getCurrentUrl() {
    //     return await this.driver.getCurrentUrl();
    // }

    async findAll(locator) {
        return await this.driver.findElements(locator);
    }
}