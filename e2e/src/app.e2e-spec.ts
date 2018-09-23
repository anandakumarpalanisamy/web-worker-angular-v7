import { AppPage } from "./app.po";

describe("workspace-project App", () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it("should display welcome message", async () => {
    page.navigateTo();
    let text = await page.getParagraphText();
    // Edge adds space at end
    text = text.trim();
    expect(text).toEqual("Welcome to web-worker-v7!");
  });
});
