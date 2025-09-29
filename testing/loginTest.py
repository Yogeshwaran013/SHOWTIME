from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

# Set path to your ChromeDriver (download from https://chromedriver.chromium.org/downloads)
CHROMEDRIVER_PATH = "C:/Users/yokes/Downloads/chromedriver-win32/chromedriver-win32/chromedriver.exe"  # <-- Update this path

# Configure Chrome options
options = Options()
options.add_argument("--start-maximized")  # Optional: starts browser maximized
options.add_argument("--disable-infobars")  # Removes "Chrome is being controlled..." message

# Start WebDriver
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=options)

try:
    # Open your login page
    driver.get("http://localhost:5000")  # <-- Replace with your actual login page URL

    time.sleep(2)  # Wait for page to load

    # Click the login/register switch if needed
    # Example: driver.find_element(By.XPATH, "//span[text()='Sign In']").click()

    # Enter email
    email_field = driver.find_element(By.NAME, "email")
    email_field.clear()
    email_field.send_keys("test@example.com")

    # Enter password
    password_field = driver.find_element(By.NAME, "password")
    password_field.clear()
    password_field.send_keys("Test@1234")

    # Submit the form
    submit_button = driver.find_element(By.ID, "submit")
    submit_button.click()

    time.sleep(5)  # Wait to observe the result

    # Optionally check login success by checking the redirected URL or some element
    print("Login test completed.")

finally:
    driver.quit()
