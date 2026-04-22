import { test, expect } from '@playwright/test';

test.describe('Customer Booking Flow', () => {
  
  test('should complete the booking process successfully', async ({ page }) => {
    // 1. Mở trang đặt lịch mô phỏng của một tiệm
    await page.goto('/luxury-spa');
    
    // Đảm bảo trang đã load và đang ở Bước 1
    await expect(page.locator('h2', { hasText: 'Select Service' })).toBeVisible();

    // === BƯỚC 1: Chọn Service ===
    // Click chọn dịch vụ "Classic Manicure"
    await page.locator('text=Classic Manicure').click();
    // Bấm Tiếp tục
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 2: Chọn Staff ===
    await expect(page.locator('h2', { hasText: 'Select Staff' })).toBeVisible();
    await page.locator('text=Sarah').click();
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 3: Chọn Date/Time ===
    await expect(page.locator('h2', { hasText: 'Select Date & Time' })).toBeVisible();
    // Chọn giờ cụ thể
    await page.locator('button:has-text("09:00 AM")').click();
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 4: Chọn Khách đi cùng ===
    await expect(page.locator('h2', { hasText: 'Guests' })).toBeVisible();
    // Tăng số lượng lên 2
    await page.locator('button').nth(2).click(); // Click nút Plus
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 5: Điền thông tin cá nhân ===
    await expect(page.locator('h2', { hasText: 'Your Information' })).toBeVisible();
    await page.fill('input[type="text"]', 'John Doe');
    await page.fill('input[type="tel"]', '1234567890');
    await page.fill('textarea', 'Please be gentle, it is my first time.');
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 6: Chọn thanh toán ===
    await expect(page.locator('h2', { hasText: 'Payment Method' })).toBeVisible();
    await page.locator('text=Pay in Store').click();
    await page.locator('button:has-text("Continue")').click();

    // === BƯỚC 7: Review và Xác nhận ===
    await expect(page.locator('h2', { hasText: 'Confirmation' })).toBeVisible();
    // Kiểm tra thông tin đã hiển thị đúng chưa
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Classic Manicure')).toBeVisible();
    
    // Bấm Confirm
    await page.locator('button:has-text("Confirm Booking")').click();

    // Đợi hiệu ứng submit (khoảng 2s như code đã viết)
    await page.waitForTimeout(2500);

    // Chụp ảnh toàn màn hình lúc xác nhận thành công
    await expect(page.locator('h2', { hasText: 'Booking Confirmed!' })).toBeVisible();
    await page.screenshot({ path: 'test-results/booking-success-fullpage.png', fullPage: true });

  });
});
