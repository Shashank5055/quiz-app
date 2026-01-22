package com.example.quiz;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.logging.Logger;
public class QuizTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private static final Logger LOGGER = Logger.getLogger(QuizTest.class.getName());
    // Absolute path to the index.html file
    private static final String APP_URL = "file:///C:/Users/Shashank%20Sharma/.gemini/antigravity/playground/exo-cassini/quiz-app/index.html";
    @BeforeClass
    public void setup() {
        LOGGER.info("Setting up ChromeDriver...");
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }
    @Test(priority = 1)
    public void verifyLandingPage() throws IOException {
        LOGGER.info("Test Step 1: Verify Landing Page");
        driver.get(APP_URL);

        takeScreenshot("1_LandingPage");

        String title = driver.getTitle();
        String url = driver.getCurrentUrl();

        LOGGER.info("Page Title: " + title);
        LOGGER.info("Page URL: " + url);

        Assert.assertEquals(title, "Drill Quiz - Test Your Knowledge");
        Assert.assertTrue(driver.findElement(By.id("home-screen")).isDisplayed());
    }
    @Test(priority = 2)
    public void startQuiz() throws IOException {
        LOGGER.info("Test Step 2: Start Quiz");
        // Select Category and Difficulty
        Select categorySelect = new Select(driver.findElement(By.id("category-select")));
        categorySelect.selectByIndex(0); // Select first category
        LOGGER.info("Selected Category: " + categorySelect.getFirstSelectedOption().getText());
        Select difficultySelect = new Select(driver.findElement(By.id("difficulty-select")));
        difficultySelect.selectByValue("easy");
        LOGGER.info("Selected Difficulty: Easy");
        takeScreenshot("2_SelectionsMade");
        // Click Start
        driver.findElement(By.id("start-btn")).click();

        // precise wait for transition
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("quiz-screen")));
        Assert.assertTrue(driver.findElement(By.id("quiz-screen")).isDisplayed(), "Quiz screen should be visible");

        takeScreenshot("3_QuizStarted");
    }
    @Test(priority = 3)
    public void navigateAndAnswerQuestions() throws IOException, InterruptedException {
        LOGGER.info("Test Step 3: Question Navigation & Answer Selection");

        // We know from the mock logic there are 5 questions for any category loop
        int totalQuestions = 5;
        for (int i = 0; i < totalQuestions; i++) {
            LOGGER.info("Processing Question " + (i + 1));

            // Verify Question is displayed
            WebElement questionText = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("question-text")));
            Assert.assertTrue(questionText.isDisplayed());
            LOGGER.info("Question Text: " + questionText.getText());
            // Verify Timer is ticking (Visual check via screenshot)

            // Select an answer (Always select the correct one or first one? Let's just select the first one index 0)
            // Note: In the real app we might want to check for correctness,
            // but for this generic test we just want to verify interaction.
            List<WebElement> options = driver.findElements(By.className("option-card"));
            if (!options.isEmpty()) {
                options.get(0).click(); // Click first option
                LOGGER.info("Selected Option: " + options.get(0).getText());
            } else {
                Assert.fail("No options found for question " + (i + 1));
            }

            takeScreenshot("4_Question_" + (i+1) + "_Answered");
            // Click Next or Submit
            WebElement nextBtn = driver.findElement(By.id("next-btn"));
            // Wait for button to be enabled
            wait.until(ExpectedConditions.elementToBeClickable(nextBtn));

            String btnText = nextBtn.getText();
            nextBtn.click();
            LOGGER.info("Clicked: " + btnText);

            // Short pause for animation/transition if needed
            Thread.sleep(500);
        }
    }
    @Test(priority = 4)
    public void verifyScoreAnalysis() throws IOException {
        LOGGER.info("Test Step 5: Score Calculation & Result Verification");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("results-screen")));

        takeScreenshot("5_ResultsPage");

        WebElement finalScore = driver.findElement(By.id("final-score"));
        WebElement correctCount = driver.findElement(By.id("count-correct"));

        LOGGER.info("Final Score: " + finalScore.getText());
        LOGGER.info("Correct Answers: " + correctCount.getText());

        Assert.assertTrue(driver.findElement(By.id("results-screen")).isDisplayed());
        Assert.assertNotEquals(finalScore.getText(), "", "Score should be displayed");

        // Check charts exist
        Assert.assertTrue(driver.findElement(By.id("timeChart")).isDisplayed(), "Time chart should be visible");
        Assert.assertTrue(driver.findElement(By.id("scoreChart")).isDisplayed(), "Score chart should be visible");
    }
    @AfterClass
    public void tearDown() {
        if (driver != null) {
            LOGGER.info("Closing browser...");
            driver.quit();
        }
    }
    private void takeScreenshot(String name) throws IOException {
        File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        // Save to target/screenshots
        String destPath = "target/screenshots/" + name + ".png";
        FileUtils.copyFile(srcFile, new File(destPath));
        LOGGER.info("Saved screenshot: " + destPath);
    }
}
