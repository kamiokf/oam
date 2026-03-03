import { chromium } from 'playwright';

async function main() {
  console.log("Starting browser test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
      console.log(`Browser Console Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
    console.log(`Browser Page Error: ${err.message}`);
  });

  try {
    await page.goto('https://r7ytrmp2.insforge.site/welcome');
    
    // Welcome -> Pick Owner
    await page.waitForSelector('text=Select Your Role');
    // The role switcher likely has 'Owner' text
    await page.getByText('Owner', { exact: true }).click();
    await page.getByText('Continue', { exact: true }).click();

    // Step 2: Personal Details
    await page.waitForSelector('text=Personal Details');
    await page.getByPlaceholder('John Doe').fill('Test Live Owner');
    await page.getByPlaceholder('123456789').fill(`123456789`);
    
    // Select Parish (Dropdown might be tricky, let's try to click it)
    await page.getByText('Select Parish').click();
    await page.getByText('Kingston', { exact: true }).click();
    
    await page.getByPlaceholder('+1 (876)').fill('8765559999');
    
    await page.getByPlaceholder('My Transport Co').fill('Test Live Biz');
    // Number of vehicles is likely a counter, default is 1, let's just click Next
    
    await page.getByText('Next Step', { exact: true }).click();

    // Step 3: Licensing & Experience (Owner)
    await page.waitForSelector('text=Business & Licensing');
    await page.getByPlaceholder('e.g., RL-123456').fill('RL-123456');
    
    // Select Route
    await page.getByText('Select primary routes').click();
    await page.getByText('Half Way Tree to Down Town').click();
    
    await page.getByText('Next Step', { exact: true }).click();

    // Step 4: Terms
    await page.waitForSelector('text=Confirmation');
    
    // Checkboxes
    const checkboxes = await page.locator('.checkmark').all(); // Guessing class, might fail. 
    // Let's use getByText
    await page.getByText('I agree to the Terms of Service').click();
    await page.getByText('I agree to the Privacy Policy').click();
    
    await page.getByText('Complete Registration', { exact: true }).click();
    
    // Wait a bit to see if error occurs
    await page.waitForTimeout(3000);
    
    if (errors.length === 0) {
      console.log("No errors caught during registration attempt.");
    }
    
  } catch (e) {
    console.error("Test script failed:", e);
  } finally {
    await browser.close();
  }
}

main();
