#!/usr/bin/env python3
import argparse
import os
import sys


def first_selector(page, selectors):
    for selector in selectors:
        if page.locator(selector).count() > 0:
            return selector
    return None


def main():
    parser = argparse.ArgumentParser(description="Log in to a HortOS page with Playwright.")
    parser.add_argument("--url", default="https://hortos.ridder.com/login")
    parser.add_argument("--username", default=os.getenv("HORTOS_USERNAME"))
    parser.add_argument("--password", default=os.getenv("HORTOS_PASSWORD"))
    parser.add_argument("--headful", action="store_true", help="Run with a visible browser window.")
    parser.add_argument("--screenshot", help="Save a screenshot after login.")
    args = parser.parse_args()

    if not args.username or not args.password:
        print("Missing credentials. Use --username/--password or HORTOS_USERNAME/HORTOS_PASSWORD.", file=sys.stderr)
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is not installed. Install with: pip install playwright && playwright install", file=sys.stderr)
        return 3

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headful)
        try:
            page = browser.new_page()
            page.goto(args.url, wait_until="domcontentloaded")

            user_selector = first_selector(
                page,
                [
                    'input[type="email"]',
                    'input[name="email"]',
                    'input[name="username"]',
                    'input[id*="email"]',
                    'input[id*="user"]',
                ],
            )
            pass_selector = first_selector(
                page,
                [
                    'input[type="password"]',
                    'input[name="password"]',
                    'input[id*="password"]',
                ],
            )
            submit_selector = first_selector(
                page,
                [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Login")',
                    'button:has-text("Sign in")',
                ],
            )

            if not user_selector or not pass_selector or not submit_selector:
                print("Could not find login form fields/buttons on the page.", file=sys.stderr)
                return 4

            login_url_before_submit = page.url
            page.fill(user_selector, args.username)
            page.fill(pass_selector, args.password)
            page.click(submit_selector)
            page.wait_for_load_state("networkidle")

            still_on_login = (
                page.url == login_url_before_submit
                and page.locator('input[type="password"]').count() > 0
            )
            if still_on_login:
                print("Login may have failed: still on the login page after submit.", file=sys.stderr)
                return 5

            if args.screenshot:
                page.screenshot(path=args.screenshot, full_page=True)

            print(f"Current URL: {page.url}")
            print(f"Page title: {page.title()}")
        finally:
            browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
