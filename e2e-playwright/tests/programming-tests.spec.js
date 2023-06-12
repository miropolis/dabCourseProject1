const { test, expect } = require("@playwright/test");

test("Server responds with a page with the title 'Programming assignments'", async ({ page }) => {
  await page.goto("/assignment-1/");
  expect(await page.title()).toBe("Programming assignments");
});

test("Create a submission that fails the test", async ({page}) => {
  await page.goto("/assignment-1/");
  await page.getByRole('textbox').fill('example value');
  await page.getByRole('button').click();
  await expect(page.locator(`p >> text='Your submission was not successful!'`)).toHaveText('Your submission was not successful!');
});

test("Create a submission that passes the test", async ({page}) => {
  await page.goto("/assignment-1/");
  await page.getByRole('textbox').fill(`def hello():
  return "Hello"`);
  await page.getByRole('button').click();
  await expect(page.locator(`p >> text='Your submission was successful!'`)).toHaveText('Your submission was successful!');
});

test("Create a submission that passes the test, goes to next assignment, and checks that it is a new one and that the points have changed", async ({page}) => {
  await page.goto("/assignment-1/");
  const firstAssignmentTitle = await page.locator("h1").textContent();
  const pointsBeforeSubmission = await page.getByTestId('points').textContent();
  await page.getByRole('textbox').fill(`def hello():
  return "Hello"`);
  await page.getByRole('button').click();
  await expect(page.locator(`p >> text='Your submission was successful!'`)).toHaveText('Your submission was successful!');
  await page.locator(`a >> text='Go to the next assignment'`).click();
  const secondAssignmentTitle = await page.locator("h1").textContent();
  const pointsAfterSubmission = await page.getByTestId('points').textContent();
  await expect(firstAssignmentTitle).not.toEqual(secondAssignmentTitle);
  await expect(pointsBeforeSubmission).not.toEqual(pointsAfterSubmission);
  await expect(page.locator("h1")).toHaveText("Assignment 2: Hello world");
});