import { defineConfig, devices } from '@playwright/test';

/**
 * Cấu hình Playwright để chạy Automated E2E Testing cho luồng Booking
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    /* Base URL để dùng cho các lệnh như `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Quay video lại toàn bộ quá trình test */
    video: 'on',
    
    /* Chụp ảnh toàn trang khi test bị fail hoặc có thể gọi lệnh chụp tự động */
    screenshot: 'on',

    /* Trace xem chi tiết lỗi */
    trace: 'on-first-retry',
  },

  /* Cấu hình các dự án (Devices) để test */
  projects: [
    {
      name: 'Mobile Chrome',
      /* Cấu hình giả lập giao diện Mobile (Mobile-first view) */
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      /* Cấu hình giả lập iPhone */
      use: { ...devices['iPhone 12'] },
    },
    /* Có thể bật Desktop nếu cần test thêm */
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
  ],

  /* Chạy server dev tự động trước khi test */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
